cat << 'BACKEND' >> /Users/maartenschraven/copilot_Workspace/moments/backend/src/index.ts

app.put('/api/admin/password', authenticateAdmin, async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: 'New password required' });
  const hash = await bcrypt.hash(newPassword, 10);
  const admin = await prisma.admin.findFirst();
  if (admin) {
    await prisma.admin.update({ where: { id: admin.id }, data: { password: hash } });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Admin not found' });
  }
});
BACKEND
