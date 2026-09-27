/**
 * Test Controller
 * Provides basic endpoints to verify API status
 */
exports.testApi = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API working'
  });
};
