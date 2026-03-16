import SOSLogs from '../models/SOSLogs.js';
import PDFDocument from 'pdfkit';

// Get location history
export const getLocationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    // Build query - use 'user' field instead of 'userId'
    const query = { user: userId };
    
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // Get SOS logs with location data
    const logs = await SOSLogs.find(query)
      .sort({ createdAt: -1 })
      .limit(1000);

    console.log(`Found ${logs.length} SOS logs for user ${userId}`);

    // Format location history - use coords.lat and coords.lng
    const history = logs
      .filter(log => log.coords && log.coords.lat && log.coords.lng)
      .map(log => ({
        _id: log._id,
        timestamp: log.createdAt || log.timestamp,
        latitude: log.coords.lat,
        longitude: log.coords.lng,
        accuracy: log.accuracy || 10,
        address: log.address || 'N/A'
      }));

    console.log(`Formatted ${history.length} location history items`);

    res.json(history);
  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({ error: error.message });
  }
};

// Export location history as CSV or PDF
export const exportLocationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const format = req.query.format || 'csv';

    // Get location history
    const logs = await SOSLogs.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(1000);

    const history = logs
      .filter(log => log.coords && log.coords.lat && log.coords.lng)
      .map(log => ({
        timestamp: log.createdAt || log.timestamp,
        latitude: log.coords.lat,
        longitude: log.coords.lng,
        accuracy: log.accuracy || 10,
        address: log.address || 'N/A'
      }));

    if (format === 'csv') {
      // Generate CSV
      const headers = 'Timestamp,Latitude,Longitude,Accuracy,Address\n';
      const csvRows = history.map(item =>
        `${item.timestamp},${item.latitude},${item.longitude},${item.accuracy},"${item.address}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=location-history-${Date.now()}.csv`);
      res.send(headers + csvRows);
    } else if (format === 'pdf') {
      // Generate PDF
      try {
        const doc = new PDFDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=location-history-${Date.now()}.pdf`);
        
        doc.pipe(res);
        
        // Add title
        doc.fontSize(20).text('Location History Report', { align: 'center' });
        doc.moveDown();
        
        // Add summary
        doc.fontSize(12);
        doc.text(`Total Points: ${history.length}`);
        doc.moveDown();
        
        // Add table
        doc.fontSize(10);
        let yPosition = doc.y;
        
        // Table headers
        doc.text('Timestamp', 50, yPosition);
        doc.text('Coordinates', 200, yPosition);
        doc.text('Accuracy', 350, yPosition);
        doc.text('Address', 420, yPosition);
        
        yPosition += 20;
        
        // Table rows
        history.slice(0, 50).forEach((item, index) => {
          doc.text(new Date(item.timestamp).toLocaleString(), 50, yPosition + (index * 15));
          doc.text(`${item.latitude.toFixed(6)}, ${item.longitude.toFixed(6)}`, 200, yPosition + (index * 15));
          doc.text(`±${item.accuracy}m`, 350, yPosition + (index * 15));
          doc.text(item.address, 420, yPosition + (index * 15), { width: 150 });
          
          if ((index + 1) % 30 === 0) {
            doc.addPage();
            yPosition = 100;
          }
        });
        
        doc.end();
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        res.status(500).json({ error: 'PDF generation is not available. Please use CSV export.' });
      }
    } else {
      res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
    }
  } catch (error) {
    console.error('Error exporting location history:', error);
    res.status(500).json({ error: error.message });
  }
};

