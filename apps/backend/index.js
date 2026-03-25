const express = require('express');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Trebor Labs API is active', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`[Trebor Labs] Backend server listening on port ${PORT}`);
});
