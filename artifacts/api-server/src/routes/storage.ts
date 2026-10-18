import { Readable } from "node:stream";
import {
  CompleteUploadBody,
  CompleteUploadResponse,
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from "@workspace/api-zod";
import { Router, type IRouter, type Request, type Response } from "express";
import { requireDhabaAdmin } from "./dhaba";
import {
  ObjectNotFoundError,
  ObjectStorageService,
} from "../lib/objectStorage";

const router: IRouter = Router();
const storage = new ObjectStorageService();
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 8 * 1024 * 1024;

router.post(
  "/storage/uploads/request-url",
  async (req: Request, res: Response): Promise<void> => {
    if (!requireDhabaAdmin(req, res)) return;
    const parsed = RequestUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    if (!allowedImageTypes.has(parsed.data.contentType)) {
      res.status(400).json({ error: "Use a JPEG, PNG, or WebP image." });
      return;
    }
    if (parsed.data.size > maxImageSize) {
      res.status(400).json({ error: "Images must be 8 MB or smaller." });
      return;
    }
    try {
      const uploadURL = await storage.getObjectEntityUploadURL();
      const objectPath = storage.normalizeObjectEntityPath(uploadURL);
      res.json(
        RequestUploadUrlResponse.parse({
          uploadURL,
          objectPath,
          metadata: parsed.data,
        }),
      );
    } catch (error) {
      req.log.error({ err: error }, "Could not create photo upload URL");
      res.status(500).json({ error: "Could not prepare the photo upload." });
    }
  },
);

router.post(
  "/storage/uploads/complete",
  async (req: Request, res: Response): Promise<void> => {
    if (!requireDhabaAdmin(req, res)) return;
    const parsed = CompleteUploadBody.safeParse(req.body);
    if (
      !parsed.success ||
      !/^\/objects\/uploads\/[0-9a-f-]{36}$/i.test(parsed.data.objectPath)
    ) {
      res.status(400).json({ error: "Invalid photo upload." });
      return;
    }
    try {
      const file = await storage.getObjectEntityFile(parsed.data.objectPath);
      const [metadata] = await file.getMetadata();
      const size = Number(metadata.size ?? 0);
      const contentType = String(metadata.contentType ?? "");
      if (size < 1 || size > maxImageSize || !allowedImageTypes.has(contentType)) {
        await file.delete({ ignoreNotFound: true });
        res.status(400).json({
          error: "Uploaded photo must be a JPEG, PNG, or WebP image up to 8 MB.",
        });
        return;
      }
      const objectPath = await storage.trySetObjectEntityAclPolicy(
        parsed.data.objectPath,
        { owner: "tiwari-dhaba", visibility: "public" },
      );
      res.json(
        CompleteUploadResponse.parse({
          imagePath: `/api/storage/objects/${objectPath.replace(/^\/objects\//, "")}`,
        }),
      );
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        res.status(404).json({ error: "Uploaded photo not found." });
        return;
      }
      req.log.error({ err: error }, "Could not finalize uploaded photo");
      res.status(500).json({ error: "Could not validate the uploaded photo." });
    }
  },
);

router.get(
  "/storage/objects/*path",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const raw = req.params.path;
      const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
      if (!/^uploads\/[0-9a-f-]{36}$/i.test(wildcardPath)) {
        res.status(404).json({ error: "Photo not found." });
        return;
      }
      const file = await storage.getObjectEntityFile(`/objects/${wildcardPath}`);
      const response = await storage.downloadObject(file, 86_400);
      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));
      if (!response.body) {
        res.end();
        return;
      }
      Readable.fromWeb(
        response.body as ReadableStream<Uint8Array>,
      ).pipe(res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        res.status(404).json({ error: "Photo not found." });
        return;
      }
      req.log.error({ err: error }, "Could not serve uploaded photo");
      res.status(500).json({ error: "Could not serve photo." });
    }
  },
);

export default router;