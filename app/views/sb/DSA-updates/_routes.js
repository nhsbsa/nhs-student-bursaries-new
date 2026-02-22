// External dependencies
const express = require('express');
const router = express.Router();


router.get('/student-docs', function (req, res) {
    const sort = req.query.sort || 'status'
    const direction = req.query.direction === 'desc' ? 'desc' : 'asc'
  
    const tableData = [
        { 
            evidenceTitle: 'Rent agreement', 
            evidenceType: 'Student Expenses', 
            status: 'complete', 
            documentType: 'Public', 
            dateUploaded: '01/09/2025 11:19', 
            action: {
                id: 'document2',
                documentId: 503,
                label: 'View',
                hiddenText: 'Rent agreement File 2'
            }
        },
        { 
            evidenceTitle: 'Student loan letter', 
            evidenceType: 'Status Assessment', 
            status: 'todo', 
            documentType: 'Public', 
            dateUploaded: '02/10/2025 11:17', 
            action: {
                id: 'document1',
                documentId: 502,
                label: 'View',
                hiddenText: 'Student loan letter File 1'
            }
        },
        { 
            evidenceTitle: 'Full student finance letter', 
            evidenceType: 'Eligibility', 
            status: 'todo', 
            documentType: 'Public', 
            dateUploaded: '23/10/2025 11:15', 
            action: {
                id: 'document0',
                documentId: 501,
                label: 'View',
                hiddenText: 'Full student finance letter File 0'
            }
        }
    ]
  
    res.render('DSA-updates/student-docs', { tableData, sort, direction })
    
})


module.exports = router;