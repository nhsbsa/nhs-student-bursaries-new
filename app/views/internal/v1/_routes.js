// ********************************
// internal v1
// ********************************

// External dependencies
const e = require('express');
const express = require('express');
const session = require('express-session');
// const moment = require('moment');
const router = express.Router();

//requestForm

router.post('/dsa/requestForm', (req, res) => {

  req.session.data['needs'] = 'email';

  res.redirect('/internal/v1/student-details');

});


// ********************************
// DSA allowances (phase 1)
// ********************************

const base = '/internal/v1/dsa';

const typeLabels = {
  general: 'General allowance',
  nmh: 'Non-medical helper',
  equipment: 'Specialist equipment',
  travel: 'Travel allowance',
  fee: 'Needs assessment fee'
};

// Every form field used while adding one allowance
const FIELDS = [
  'allowance-type',
  'allowance-amount', 'allowance-notes',
  'nmh-service', 'nmh-provider', 'nmh-hours', 'nmh-amount', 'nmh-notes',
  'travel-amount', 'travel-journeys', 'travel-notes'
];

// Turn "1,200" or "£1200.5" into 1200.5
function num (value) {
  const n = parseFloat(String(value || '').replace(/[£,\s]/g, ''));
  return isNaN(n) ? 0 : n;
}

// Turn 1200.5 into "£1,200.50"
function money (value) {
  return '£' + num(value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function clearFields (data) {
  FIELDS.forEach(f => { delete data[f]; });
}

// Build one allowance from the answers on the current pages
function currentAllowance (data) {
  const type = data['allowance-type'];
  const item = { type: type, label: typeLabels[type] || '' };

  if (type === 'nmh') {
    item.amount = num(data['nmh-amount']);
    item.hours = data['nmh-hours'];
    item.service = data['nmh-service'];
    item.provider = data['nmh-provider'];
    item.notes = data['nmh-notes'];
    item.details = [data['nmh-service'], data['nmh-provider']].filter(Boolean).join(', ');
  } else if (type === 'travel') {
    item.amount = num(data['travel-amount']);
    item.journeys = data['travel-journeys'];
    item.notes = data['travel-notes'];
    item.details = data['travel-notes'];
  } else {
    item.amount = num(data['allowance-amount']);
    item.notes = data['allowance-notes'];
    item.details = data['allowance-notes'];
  }

  item.amountDisplay = money(item.amount);

  if (type === 'nmh' && num(item.hours) > 0) {
    item.rate = money(item.amount / num(item.hours));
  }

  return item;
}

function listAndTotal (data) {
  const list = data['allowances'] || [];
  const total = money(list.reduce((sum, i) => sum + num(i.amount), 0));
  return { list: list, total: total };
}

// DSA summary: one decision question, routed by the answer
router.post('/dsa/summary', (req, res) => {
  const decision = req.session.data['dsa-decision'];

  if (!decision) {
    req.session.data['dsa-decision-error'] = 'true';
    return res.redirect(base + '/summary');
  }
  delete req.session.data['dsa-decision-error'];

  if (decision === 'approve') {
    return res.redirect(base + '/add-allowances');
  }
  if (decision === 'needs') {
    return res.redirect(base + '/requestForm?dsa=needs');
  }
  if (decision === 'evidence') {
    return res.redirect(base + '/requestForm?dsa=evidence');
  }
  if (decision === 'reject') {
    return res.redirect(base + '/requestForm?dsa=reject');
  }
  res.redirect(base + '/summary');
});

// Approve on the DSA summary: start adding allowances
router.get('/dsa/add-allowances', (req, res) => {
  clearFields(req.session.data);
  delete req.session.data['edit-index'];
  res.render('internal/v1/dsa/add-allowances');
});

// What type of allowance is this? -> next page depends on the answer
router.post('/dsa/allowance-type', (req, res) => {
  const type = req.session.data['allowance-type'];

  if (!type) {
    return res.redirect(base + '/allowance-type');
  }
  if (type === 'nmh') {
    return res.redirect(base + '/nmh-details');
  }
  if (type === 'travel') {
    return res.redirect(base + '/travel-details');
  }
  res.redirect(base + '/allowance-amount');
});

// Amount, NMH details and travel details all go to the check page
router.post('/dsa/allowance-amount', (req, res) => {
  res.redirect(base + '/check-allowance');
});

router.post('/dsa/nmh-details', (req, res) => {
  res.redirect(base + '/check-allowance');
});

router.post('/dsa/travel-details', (req, res) => {
  res.redirect(base + '/check-allowance');
});

// Check allowance details
router.get('/dsa/check-allowance', (req, res) => {
  const item = currentAllowance(req.session.data);
  res.render('internal/v1/dsa/check-allowance', { item: item });
});

// Save the allowance into the list (or replace it, if it was changed from the list)
router.post('/dsa/check-allowance', (req, res) => {
  const data = req.session.data;
  data['allowances'] = data['allowances'] || [];

  const item = currentAllowance(data);
  item.fields = {};
  FIELDS.forEach(f => { item.fields[f] = data[f]; });

  if (data['edit-index'] !== undefined && data['edit-index'] !== '') {
    data['allowances'][parseInt(data['edit-index'], 10)] = item;
    delete data['edit-index'];
  } else {
    data['allowances'].push(item);
  }

  clearFields(data);
  delete data['add-another'];
  res.redirect(base + '/allowances');
});

// DSA allowances list
router.get('/dsa/allowances', (req, res) => {
  const { list, total } = listAndTotal(req.session.data);

  if (list.length === 0) {
    return res.redirect(base + '/add-allowances');
  }
  res.render('internal/v1/dsa/allowances', { list: list, total: total });
});

// Do you want to add another allowance?
router.post('/dsa/allowances', (req, res) => {
  const answer = req.session.data['add-another'];

  if (answer === 'yes') {
    clearFields(req.session.data);
    delete req.session.data['add-another'];
    return res.redirect(base + '/allowance-type');
  }
  if (answer === 'no') {
    delete req.session.data['add-another'];
    return res.redirect(base + '/check-dsa-allowances');
  }
  res.redirect(base + '/allowances');
});

// Change an allowance from the list
router.get('/dsa/change-allowance/:index', (req, res) => {
  const data = req.session.data;
  const item = (data['allowances'] || [])[req.params.index];

  if (!item) {
    return res.redirect(base + '/allowances');
  }
  FIELDS.forEach(f => { data[f] = item.fields[f]; });
  data['edit-index'] = req.params.index;
  res.redirect(base + '/check-allowance');
});

// Remove an allowance: show the warning page first
router.get('/dsa/remove-allowance/:index', (req, res) => {
  const list = req.session.data['allowances'] || [];
  const index = parseInt(req.params.index, 10);
  const item = list[index];

  if (!item) {
    return res.redirect(base + '/allowances');
  }
  res.render('internal/v1/dsa/remove-allowance', { item: item, index: index });
});

// Remove an allowance: only remove it after the processor confirms
router.post('/dsa/remove-allowance/:index', (req, res) => {
  const list = req.session.data['allowances'] || [];
  const index = parseInt(req.params.index, 10);

  if (list[index]) {
    list.splice(index, 1);
  }
  res.redirect(base + '/allowances');
});

// Check DSA allowances (all of them)
router.get('/dsa/check-dsa-allowances', (req, res) => {
  const { list, total } = listAndTotal(req.session.data);
  res.render('internal/v1/dsa/check-dsa-allowances', { list: list, total: total });
});

router.post('/dsa/check-dsa-allowances', (req, res) => {
  req.session.data['dsa-allowances-saved'] = 'yes';
  res.redirect(base + '/allowances-set-up');
});

// DSA allowances set up
router.get('/dsa/allowances-set-up', (req, res) => {
  const { list, total } = listAndTotal(req.session.data);
  res.render('internal/v1/dsa/allowances-set-up', { list: list, total: total });
});

module.exports = router;