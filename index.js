// SPDX-License-Identifier: MIT-0

'use strict';

const IN_TO_CM = 2.54;
const CM_TO_IN = 1 / IN_TO_CM;

function sq(x) {
  return x * x;
}

function fraction(numerator, denominator) {
  return { n: numerator, d: denominator };
}

// based on https://www.johndcook.com/blog/2010/10/20/best-rational-approximation/
function farey(x, n) {
  var l = fraction(0, 1);
  var u = fraction(1, 1);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const m = fraction(l.n + u.n, l.d + u.d);
    const mediant = m.n / m.d;
    // invariant: (l.n / l.d) < mediant < (u.n / u.d)
    if (x == mediant) {
      if (m.d <= n)
        return m;
      else if (u.d > l.d)
        return u;
      else
        return l;
    } else if (x > mediant) {
      if (m.d > n) return u;
      l = m;
    } else {
      if (m.d > n) return l;
      u = m;
    }
  }
}

function approximateRatio(x, n) {
  if (x == 0)
    return fraction(0, 1);

  var negate = false;
  if (x < 0) {
    negate = true;
    x = -x;
  }

  var ret;

  if (x < 1)
    ret = farey(x, n);
  else if (x == 1)
    ret = fraction(1, 1);
  else {
    ret = farey(1 / x, n);
    ret = fraction(ret.d, ret.n);
  }

  if (negate)
    ret.n = -ret.n;
  return ret;
}

window.onload = function() {
  const resX = document.getElementById('resX');
  const resY = document.getElementById('resY');
  const dpi  = document.getElementById('dpi');
  const dimD = document.getElementById('dimD');
  const dimX = document.getElementById('dimX');
  const dimY = document.getElementById('dimY');
  const aspX = document.getElementById('aspX');
  const aspY = document.getElementById('aspY');
  const note = document.getElementById('note');

  const buttonSave = document.getElementById('buttonSave');

  const table = document.getElementById('memory');

  buttonSave.onclick = function () {
    const state = [];
    state.push([resX, resY, dimD, dpi, dimX, dimY, aspX, aspY].map(x => +x.value).concat([note.value]));
    for (const row of table.rows) {
      const values = [];
      for (let i = 0; i < 8; ++i) {
        values.push(+row.childNodes[i].textContent);
      }
      values.push(row.childNodes[8].textContent);
      state.push(values);
    }
    window.location.hash = JSON.stringify(state);
    // const url = new URL(window.location);
    // url.hash = JSON.stringify(state);
    // history.replaceState(null, '', url.href);
    buttonSave.disabled = true;
  };

  function updateAspect(a) {
    const aspect = approximateRatio(a, 999);
    aspX.value = aspect.n;
    aspY.value = aspect.d;
  }

  function updateFromResDiag() {
    const a = +resX.value / +resY.value;
    const dimXIn = Math.sqrt(sq(a * +dimD.value) / (sq(a) + 1));
    const dimYIn = Math.sqrt(sq(    +dimD.value) / (sq(a) + 1));
    dimX.value = (IN_TO_CM * dimXIn).toFixed(1);
    dimY.value = (IN_TO_CM * dimYIn).toFixed(1);
    dpi .value = (resY.value / dimYIn).toFixed(1);
    updateAspect(a);
    buttonSave.disabled = false;
  }

  function updateFromResDPI() {
    dimD.value = (Math.sqrt(sq(+resX.value) + sq(+resY.value)) / +dpi.value).toFixed(1);
    dimX.value = (IN_TO_CM * +resX.value / +dpi.value).toFixed(1);
    dimY.value = (IN_TO_CM * +resY.value / +dpi.value).toFixed(1);
    updateAspect(+resX.value / +resY.value);
    buttonSave.disabled = false;
  }

  function updateFromDimDPI() {
    resX.value = (CM_TO_IN * +dimX.value * +dpi.value).toFixed(0);
    resY.value = (CM_TO_IN * +dimY.value * +dpi.value).toFixed(0);
    dimD.value = (Math.sqrt(sq(+resX.value) + sq(+resY.value)) / +dpi.value).toFixed(1);
    updateAspect(+dimX.value / +dimY.value);
    buttonSave.disabled = false;
  }

  resX.oninput = updateFromResDiag;
  resY.oninput = updateFromResDiag;
  dpi .oninput = updateFromResDPI;
  dimD.oninput = updateFromResDiag;
  dimX.oninput = updateFromDimDPI;
  dimY.oninput = updateFromDimDPI;
  // aspX.oninput = function () {  };
  // aspY.oninput = function () {  };
  note.oninput = function () { buttonSave.disabled = false; };

  function addRow(_resX, _resY, _dimD, _dpi, _dimX, _dimY, _aspX, _aspY, _note) {
    const row = table.insertRow(-1);
    row.insertCell(-1).textContent = (+_resX).toFixed(0);
    row.insertCell(-1).textContent = (+_resY).toFixed(0);
    row.insertCell(-1).textContent = (+_dimD).toFixed(1);
    row.insertCell(-1).textContent = (+_dpi ).toFixed(1);
    row.insertCell(-1).textContent = (+_dimX).toFixed(1);
    row.insertCell(-1).textContent = (+_dimY).toFixed(1);
    row.insertCell(-1).textContent = (+_aspX).toFixed(0);
    row.insertCell(-1).textContent = (+_aspY).toFixed(0);
    row.insertCell(-1).textContent = _note;

    for (let i = 0; i < 8; ++i) {
      row.cells[i].style="padding-right: 1em; text-align: right;";
    }

    const buttonRestore = document.createElement("button");
    buttonRestore.textContent = 'restore';
    buttonRestore.onclick = function () {
      resX.value = row.childNodes[0].textContent;
      resY.value = row.childNodes[1].textContent;
      dimD.value = row.childNodes[2].textContent;
      dpi .value = row.childNodes[3].textContent;
      dimX.value = row.childNodes[4].textContent;
      dimY.value = row.childNodes[5].textContent;
      aspX.value = row.childNodes[6].textContent;
      aspY.value = row.childNodes[7].textContent;
      note.value = row.childNodes[8].textContent;
      buttonSave.disabled = false;
    };

    const buttonRemove = document.createElement("button");
    buttonRemove.textContent = 'remove';
    buttonRemove.onclick = function () { row.remove(); buttonSave.disabled = false; };

    const buttonMoveUp = document.createElement("button");
    buttonMoveUp.textContent = '↑';
    buttonMoveUp.style.minWidth = '3em';
    buttonMoveUp.onclick = function () {
      if (row.previousElementSibling !== null) {
        row.parentNode.insertBefore(row, row.previousElementSibling);
        buttonSave.disabled = false;
      }
    };

    const buttonMoveDown = document.createElement("button");
    buttonMoveDown.textContent = '↓';
    buttonMoveDown.style.minWidth = '3em';
    buttonMoveDown.onclick = function () {
      if (row.nextElementSibling !== null) {
        row.parentNode.insertBefore(row.nextElementSibling, row);
        buttonSave.disabled = false;
      }
    };

    const buttons = row.insertCell(-1);
    buttons.appendChild(buttonRestore);
    buttons.appendChild(buttonRemove);
    buttons.appendChild(buttonMoveUp);
    buttons.appendChild(buttonMoveDown);
    buttons.style = 'white-space: nowrap;';
  }
  document.getElementById('buttonAdd').onclick = function () {
    addRow(resX.value, resY.value, dimD.value, dpi.value, dimX.value, dimY.value, aspX.value, aspY.value, note.value);
    buttonSave.disabled = false;
  };

  if (window.location.hash) {
    try {
      const state = JSON.parse(decodeURIComponent(window.location.hash).substring(1));
      resX.value = state[0][0];
      resY.value = state[0][1];
      dimD.value = state[0][2];
      dpi .value = state[0][3];
      dimX.value = state[0][4];
      dimY.value = state[0][5];
      aspX.value = state[0][6];
      aspY.value = state[0][7];
      note.value = state[0][8];
      for (let i = 1; i < state.length; ++i) {
        const r = state[i];
        addRow(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8]);
      }
    } catch (e) {
      console.warn('error while loading state from URL hash:', e);
    }
  } else {
    updateFromResDiag();
  }
  buttonSave.disabled = true;
};
