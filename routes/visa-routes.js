const express = require('express');
const router = express.Router();
const FundsTransferApi = require('../lib/visa-api');
const api = new FundsTransferApi();

router.post('/pushfunds', (req, res) => {
    api.pushFunds(req.body)
        .then(result => {
            res.status(200).send(result);
        })
        .catch(error => {
            res.status(500).send(error);
        });
});

module.exports = router;
