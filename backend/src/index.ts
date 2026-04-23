import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

app.use(cors());
app.use(express.json());
const uploadsDir = path.join(import.meta.dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.memoryStorage();
const upload = multer({ storage });

const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') throw new Error();
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authenticateClient = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'client') throw new Error();
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Initialize Admin
(async () => {
  const adminCount = await prisma.admin.count();
  if (adminCount === 0) {
    const hash = await bcrypt.hash('admin', 10);
    await prisma.admin.create({ data: { username: 'admin', password: hash } });
    console.log('Default admin created: admin/admin');
  }
})();

app.post('/api/admin/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET);
  res.json({ token });
});

app.get('/api/admin/clients', authenticateAdmin, async (req: Request, res: Response) => {
  const clients = await prisma.client.findMany({ include: { photos: true } });
  res.json(clients);
});

app.post('/api/admin/clients', authenticateAdmin, async (req: Request, res: Response) => {
  const { title, subtitle, date, password, accentColor, backgroundColor, fontFamily, headerColor, headerTextColor, headerFontFamily } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const dateObj = date ? new Date(date) : null;
  const client = await prisma.client.create({
    data: { title, subtitle, date: dateObj, password: hash, accentColor, backgroundColor, fontFamily },
  });
  res.json(client);
});

app.put('/api/admin/clients/:id', authenticateAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, subtitle, date, password, accentColor, backgroundColor, fontFamily, headerColor, headerTextColor, headerFontFamily } = req.body;
  const data: any = { title, subtitle, accentColor, backgroundColor, fontFamily, headerColor, headerTextColor, headerFontFamily };
  if (date) data.date = new Date(date);
  if (password) data.password = await bcrypt.hash(password, 10);
  
  const client = await prisma.client.update({ where: { id }, data });
  res.json(client);
});

app.delete('/api/admin/clients/:id', authenticateAdmin, async (req: Request, res: Response) => {
  await prisma.client.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

app.post('/api/admin/clients/:id/photos', authenticateAdmin, upload.array('photos'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];
  
  const clientDir = path.join(uploadsDir, id);
  if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });

  const uploadedPhotos = [];
  for (const file of files) {
    const originalName = Date.now() + '-orig-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
    const thumbName = Date.now() + '-thumb.webp';
    const originalPath = path.join(clientDir, originalName);
    const thumbPath = path.join(clientDir, thumbName);

    fs.writeFileSync(originalPath, file.buffer);
    await sharp(file.buffer).resize({ width: 800 }).webp({ quality: 80 }).toFile(thumbPath);

    const uploaded = await prisma.photo.create({
      data: {
        clientId: id,
        originalUrl: '/uploads/' + id + '/' + originalName,
        thumbnailUrl: '/uploads/' + id + '/' + thumbName,
      }
    });
    uploadedPhotos.push(uploaded);
  }
  res.json(uploadedPhotos);
});

app.delete('/api/admin/photos/:id', authenticateAdmin, async (req: Request, res: Response) => {
  const photo = await prisma.photo.findUnique({ where: { id: req.params.id } });
  if (photo) {
    try {
      fs.unlinkSync(path.join(import.meta.dirname, '../../', photo.originalUrl));
      fs.unlinkSync(path.join(import.meta.dirname, '../../', photo.thumbnailUrl));
    } catch(e) {}
    await prisma.photo.delete({ where: { id: req.params.id } });
  }
  res.json({ success: true });
});

app.post('/api/client/login', async (req: Request, res: Response) => {
  const { password } = req.body;
  const clients = await prisma.client.findMany();
  for (const client of clients) {
    if (await bcrypt.compare(password, client.password)) {
      const token = jwt.sign({ id: client.id, role: 'client' }, JWT_SECRET);
      return res.json({ token, client: { id: client.id, title: client.title, subtitle: client.subtitle, date: client.date, accentColor: client.accentColor, backgroundColor: client.backgroundColor, fontFamily: client.fontFamily } });
    }
  }
  res.status(401).json({ error: 'Invalid password' });
});

app.get('/api/client/me', authenticateClient, async (req: Request, res: Response) => {
  const client = await prisma.client.findUnique({
    where: { id: (req as any).user.id },
    select: { id: true, title: true, subtitle: true, date: true, accentColor: true, backgroundColor: true, fontFamily: true, photos: true }
  });
  res.json(client);
});

app.get('/api/client/download', authenticateClient, async (req: Request, res: Response) => {
  const clientId = (req as any).user.id;
  const ids = req.query.ids ? (req.query.ids as string).split(',') : null;
  
  let photos;
  if (ids && ids.length > 0) {
    photos = await prisma.photo.findMany({ where: { clientId, id: { in: ids } } });
  } else {
    photos = await prisma.photo.findMany({ where: { clientId } });
  }

  const archive = archiver('zip', { zlib: { level: 9 } });
  res.attachment('moments.zip');
  archive.pipe(res);

  for (const photo of photos) {
    const filePath = path.join(import.meta.dirname, '../../', photo.originalUrl);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: path.basename(filePath) });
    }
  }
  archive.finalize();
});

app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});
