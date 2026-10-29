// @ts-nocheck
/* Bolsa de Brokers engine (from Saul's Bolsa app): WhatsApp exports -> offers, requests, brokers, matches. Admin only. */

/* Motor de extracción: exportaciones de WhatsApp -> propiedades, búsquedas, brokers, coincidencias.
   Portado de pipeline/run.py + extract.py. Funciona en el navegador y en Node (para pruebas). */
const Engine = (() => {
  // ------------------------------------------------------------ utilidades de texto
  const stripAcc = s => s.normalize('NFD').replace(/\p{Mn}/gu, '');
  const norm = s => s.replace(/[\u2060\u200b\u200e\u200f\u202a-\u202e]/g, '').replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ');
  const low = s => stripAcc(norm(s)).toLowerCase();
  const stripChars = (s, chars) => { let a = 0, b = s.length; while (a < b && chars.includes(s[a])) a++; while (b > a && chars.includes(s[b - 1])) b--; return s.slice(a, b); };
  const cleanLine = s => {
    s = norm(s).replace(/[\p{So}\p{Sk}\p{Cf}\p{Mn}\uFE0F\u20E3]/gu, '');
    s = s.replace(/\*/g, '').replace(/_/g, ' ').replace(/~/g, '');
    return stripChars(s.replace(/\s+/g, ' ').trim(), ' -•:|.,');
  };
  const title = s => s.toLowerCase().replace(/(^|[^\p{L}\p{N}'])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  const hash = (str, seed = 0) => { let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36).padStart(10, '0').slice(-10); };
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const daysDiff = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);
  const counter = arr => { const m = new Map(); for (const x of arr) m.set(x, (m.get(x) || 0) + 1); return m; };
  const mostCommon = m => [...m.entries()].sort((a, b) => b[1] - a[1]);
  const median = xs => { xs = xs.filter(x => x).sort((a, b) => a - b); if (!xs.length) return null; const k = xs.length >> 1; return xs.length % 2 ? xs[k] : (xs[k - 1] + xs[k]) / 2; };

  // ------------------------------------------------------------ zonas
  const ZONES = [
    ['Costa del Este', 'costa del este|(?:en|zona|area|de|a|cerca de)\\s+cde\\b|^\\W*cde\\b|costa del\\b'], ['Santa María', 'santa maria'],
    ['Punta Pacífica', 'punta pacifica|p\\.? ?pacifica|ppacifica'], ['Paitilla', 'paitilla'],
    ['San Francisco', 'san francisco|san fco|sanfrancisco|sn fco'], ['Coco del Mar', 'coco del ?mar'],
    ['Obarrio', 'obarrio'], ['Bella Vista', 'bella ?vista'], ['El Cangrejo', 'cangrejo'],
    ['Marbella', 'marbella'], ['Avenida Balboa', '(?:av(?:enida|e)?\\.? ?)?balboa|cinta costera'],
    ['Calle 50', 'calle 50'], ['Vía Porras', 'via porras'], ['Vía Israel', 'via israel'],
    ['Vía España', 'via espana'], ['Vía Argentina', 'via argentina'], ['Carrasquilla', 'carrasquilla'],
    ['Altos del Golf', 'altos del golf'], ['Altos del Chase', 'altos del chase'],
    ['Versalles', 'versalles'], ['Condado del Rey', 'condado del rey'], ['Betania', 'bethania|betania'],
    ['El Dorado', 'el dorado'], ['Clayton', 'clayton'], ['Albrook', 'albrook'],
    ['Panamá Pacífico', 'panama[ -]pacifico|panamapacifico|howard'], ['Casco Viejo', 'casco (?:viejo|antiguo)'],
    ['Amador', 'amador'], ['Ancón', 'ancon'], ['Transístmica', 'transi?stmica'],
    ['Juan Díaz', 'juan diaz'], ['Costa Sur', 'costa sur'], ['Llano Bonito', 'llano bonito'],
    ['Brisas del Golf', 'brisas del golf'], ['Villa Lucre', 'villa lucre'], ['Tocumen', 'tocumen'],
    ['Pacora', 'pacora'], ['Las Cumbres', 'las cumbres'], ['Los Andes', 'los andes'],
    ['Tumba Muerto', 'tumba muerto'], ['Don Bosco', 'don bosco'], ['Edison Park', 'edison park'],
    ['Hato Pintado', 'hato pintado'], ['Pueblo Nuevo', 'pueblo nuevo'], ['Río Abajo', 'rio abajo'],
    ['Parque Lefevre', 'parque lefevre'], ['Vista Hermosa', 'vista hermosa'], ['San Miguelito', 'san miguelito'],
    ['Ciudad del Saber', 'ciudad del saber|clayton'], ['Corozal', 'corozal'], ['Cárdenas', 'cardenas'],
    ['Arraiján', 'arraijan'], ['La Chorrera', 'chorrera'], ['Coronado', 'coronado'], ['Chame', 'chame'],
    ['San Carlos', 'san carlos'], ['Gorgona', 'gorgona'], ['Playa Blanca', 'playa blanca'],
    ['Buenaventura', 'buenaventura'], ['Río Hato', 'rio hato|farallon'], ['Santa Clara', 'santa clara'],
    ['El Valle', 'el valle'], ['Pedasí', 'pedasi'], ['Chitré', 'chitre'], ['Boquete', 'boquete'],
    ['David', '\\bdavid\\b(?! )'], ['Colón', '\\bcolon\\b'], ['Bocas del Toro', 'bocas del toro'],
    ['Cerro Azul', 'cerro azul'], ['Antón', '\\banton\\b|juan hombro'], ['Campo Lindo', 'campo lindo'],
    ['Villa de las Fuentes', 'villa de las fuentes'], ['Chanis', 'chanis'], ['Bijao', 'bijao'],
    ['Las Acacias', 'las acacias'], ['Dos Mares', 'dos mares'], ['Ciudad Radial', 'ciudad radial'],
    ['Altos de Panamá', 'altos de panama'], ['Brisas', '\\bbrisas\\b(?! del golf)'],
  ].map(([z, p]) => [z, new RegExp(p)]);
  const BLDG_ZONE = {
    'top tower': 'Costa del Este', 'parkside': 'Costa del Este', 'green view': 'Costa del Este', 'ivy': 'Costa del Este',
    'vivendi': 'Costa del Este', 'luxor': 'Costa del Este', 'quartier': 'San Francisco', 'atlapa': 'San Francisco',
    'yoo': 'Avenida Balboa', 'grandbay': 'Avenida Balboa', 'grand bay': 'Avenida Balboa', 'bayfront': 'Avenida Balboa',
    'central park': 'Transístmica', 'river valley': 'Panamá Pacífico', 'nuovo': 'Costa del Este',
    'pacific sky': 'Punta Pacífica', 'ocean reef': 'Punta Pacífica', 'jw marriot': 'Punta Pacífica', 'trump': 'Punta Pacífica', 'ocean club': 'Punta Pacífica',
    'altamira': 'Altos de Panamá', 'armani': 'Costa del Este', 'oasis': 'Costa del Este', 'aqualina': 'Punta Pacífica',
    'pearl at the sea': 'Punta Pacífica', 'dupont': 'Punta Pacífica', 'rivage': 'Avenida Balboa', 'f&f': 'Avenida Balboa',
    'waterfalls': 'San Francisco', 'quadrat': 'San Francisco',
  };
  let BZ = {}, FIXES = [];   // edificio -> zona (aprendido de los mensajes) · correcciones tuyas
  function zonesExplicit(t){ const l = low(t), out = []; for (const [z, rx] of ZONES) if (rx.test(l) && !out.includes(z)) out.push(z); return out; }
  function zonesOf(t){
    const l = low(t);
    for (const f of FIXES) if (f.match && l.includes(f.match)) return [f.zone];
    const out = zonesExplicit(t);
    if (!out.length){ const ls = l.replace(/\s+/g, ''); for (const b in BZ) if ((l.includes(b) || (b.length > 5 && ls.includes(b.replace(/\s+/g, '')))) && !out.includes(BZ[b])) out.push(BZ[b]); }
    return out;
  }
  /* aprende en qué zona está cada edificio: mensajes que nombran el edificio y UNA sola zona */
  function learnBuildings(texts){
    const cnt = new Map(), keys = Object.keys(BLDG_ZONE);
    for (const t of texts){
      const zs = zonesExplicit(t); if (zs.length !== 1) continue;
      const l = low(t), ks = new Set(keys.filter(k => l.includes(k)));
      const b = buildingOf(t); if (b){ const k = low(b.replace(/^PH /, '')).trim(); if (k.length >= 4 && !/^(en|de|del|torre|tower|towers)$/.test(k)) ks.add(k); }
      for (const k of ks){ if (!cnt.has(k)) cnt.set(k, new Map()); const m = cnt.get(k); m.set(zs[0], (m.get(zs[0]) || 0) + 1); }
    }
    BZ = {};
    for (const [k, m] of cnt){ const tot = [...m.values()].reduce((a, b) => a + b, 0), top = mostCommon(m)[0]; if (tot >= 2 && top[1] / tot >= 0.6) BZ[k] = top[0]; }
    for (const k of keys) if (!cnt.has(k)) BZ[k] = BLDG_ZONE[k];   // sin datos: queda el valor conocido
  }

  // ------------------------------------------------------------ tipos
  const TYPES = [
    ['Local', '\\blocal(?:es)?\\b|plaza comercial|uso comercial'], ['Oficina', 'oficina'],
    ['Galera/Bodega', 'galera|bodega|deposito\\b|nave'], ['Terreno/Lote', 'terreno|\\blote\\b|hectarea|finca'],
    ['Edificio', '\\bedificio\\b(?! viejo| antiguo)'], ['Casa', '\\bcasa\\b|duplex|townhouse|chalet'],
    ['Apartamento', 'apartamento|\\bapto\\b|\\bapt\\b|\\bph\\b|penthouse|loft|estudio|monoambiente|aparta'],
  ].map(([t, p]) => [t, new RegExp(p)]);
  const SLUG_TYPES = [['apartamento', 'Apartamento'], ['casa', 'Casa'], ['local', 'Local'], ['oficina', 'Oficina'], ['lote', 'Terreno/Lote'],
    ['terreno', 'Terreno/Lote'], ['bodega', 'Galera/Bodega'], ['galera', 'Galera/Bodega'], ['edificio', 'Edificio'], ['finca', 'Terreno/Lote']];
  function typeOf(t, slug = ''){
    const l = low(t) + ' ' + slug;
    if (slug) for (const [k, ty] of SLUG_TYPES) if (slug.startsWith(k)) return ty;
    let best = null;
    for (const [ty, rx] of TYPES){ const m = rx.exec(l); if (m && (!best || m.index < best[0])) best = [m.index, ty]; }
    if (best) return best[1];
    if (/\d\s*(rec|hab|alcoba)/.test(l)) return 'Apartamento';
    return null;
  }

  // ------------------------------------------------------------ números
  function parseAmount(s, suf){
    s = String(s).trim().replace(/ /g, ''); suf = (suf || '').toLowerCase();
    if (/\d{3}[.,]00$/.test(s)) s = s.replace(/[.,]00$/, '');
    let v;
    if (/^\d{1,3}([.,]\d{3})+$/.test(s)) v = parseFloat(s.replace(/[.,]/g, ''));
    else { if (!/^\d+([.,]\d+)?$/.test(s)) return null; v = parseFloat(s.replace(',', '.')); }
    if (isNaN(v)) return null;
    if (suf === 'k' || suf === 'mil') v *= 1000;
    else if (['mm', 'm', 'millones', 'millon', 'mill'].includes(suf)) v *= 1e6;
    return v;
  }
  const PRICE_RX = /(?:us\$|\$|usd|b\/\.)\s*(\d[\d.,]*)\s*(k|mm|mil(?:lones|lon)?|m\b)?|(\d[\d.,]*)\s*(k|mm|mil|millones)\b\s*(?:\$|usd|dolares)?/gi;
  const PRICE_KEY_RX = /(?:precio|presupuesto|canon|alquiler|venta|max(?:imo)?|hasta|budget|valor|renta)[^\d\n$]{0,25}(\d[\d.,]*)\s*(k|mm|mil)?/gi;
  function pricesOf(t){
    let l = low(t);
    l = l.replace(/\d+\s*(?:m2|m²|mts2?|metros|mt2|mtrs|m\b)/g, ' ').replace(/(?:\+?507)?\s*\d{4}[- ]?\d{4}/g, ' ').replace(/https?:\/\/\S+/g, ' ');
    const vals = [];
    for (const m of l.matchAll(PRICE_RX)){
      const [num, suf] = m[1] ? [m[1], m[2]] : [m[3], m[4]];
      const v = parseAmount(stripChars(num, '.,'), suf); if (v && v >= 100) vals.push(v);
    }
    if (!vals.length) for (const m of l.matchAll(PRICE_KEY_RX)){
      const v = parseAmount(stripChars(m[1], '.,'), m[2]); if (v && v >= 100 && !(v >= 1900 && v <= 2100 && l.includes('ano'))) vals.push(v);
    }
    if (!vals.length) for (const m of norm(t).matchAll(/\*\s*(\d{3}[.,]?\d{0,3}|\d{1,3}[.,]\d{3})\s*\*/g)){
      const v = parseAmount(m[1]); if (v && v >= 300) vals.push(v);
    }
    return vals;
  }
  const REC_U = 'recamaras?|rec\\b|recs\\b|r\\b|habitaciones|habitacion|hab\\b|habs\\b|alcobas?|cuartos|dormitorios|recamra';
  const PARK_U = 'parkings?|estacionamientos?|est\\b|estac\\b|garajes?|e\\b|puestos';
  const RX_REC1 = new RegExp('(?<![\\d.,])(\\d{1,2})(?:[ \\t]*(?:o|a|-|/|y|ó)[ \\t]*(\\d{1,2}))?[ \\t]*(?:(?:amplias?|grandes?|comodas?|lindas?)[ \\t]+)?(?:' + REC_U + ')');
  const RX_REC2 = new RegExp('(?:' + REC_U + ')[ \\t]*:?[ \\t]*(\\d{1,2})(?![\\d.,])(?:[ \\t]*(?:o|a|-|/|y)[ \\t]*(\\d{1,2}))?');
  const RX_PARK1 = new RegExp('(?<![\\d.,])(\\d{1,2})(?:[ \\t]*(?:o|a|-|/|y|ó)[ \\t]*(\\d{1,2}))?[ \\t]*(?:(?:amplias?|grandes?|comodas?|lindas?)[ \\t]+)?(?:' + PARK_U + ')');
  const RX_PARK2 = new RegExp('(?:' + PARK_U + ')[ \\t]*:?[ \\t]*(\\d{1,2})(?![\\d.,])(?:[ \\t]*(?:o|a|-|/|y)[ \\t]*(\\d{1,2}))?');
  const RX_REC_ANY = new RegExp('\\d\\s*(?:' + REC_U + ')');
  function numRange(l, rx1, rx2){
    const m = rx1.exec(l) || rx2.exec(l); if (!m) return [null, null];
    const a = +m[1], b = m[2] ? +m[2] : a;
    if (a > 20 || b > 20) return [null, null];
    return [Math.min(a, b), Math.max(a, b)];
  }
  function m2Of(l){ const v = []; for (const m of l.matchAll(/(\d[\d.,]*)\s*(?:m2|m²|mts2?|metros(?: cuadrados)?|mt2|mtrs|m\b)/g)){ const x = parseAmount(stripChars(m[1], '.,')); if (x && x >= 15 && x <= 2e6) v.push(x); } return v; }
  function bathsOf(l){ const m = /(\d(?:[.,]5)?)\s*(?:banos?|b\b)/.exec(l) || /banos?\s*:?\s*(\d(?:[.,]5)?)/.exec(l); if (!m) return null; const v = parseFloat(m[1].replace(',', '.')); return v <= 10 ? v : null; }

  const URL_RX = /https?:\/\/\S+/g;
  const PHONE_RX = /(?:\+?507[\s.-]?)?(6\d{3})[\s.-]?(\d{4})(?!\d)/g;
  const DEMAND_RX = /(?:^|[\s*_>])(busco|buscamos|se busca|se buscan|busqueda|buscando|cliente busca|clientes buscan|requiero|requerimos|necesito|necesitamos|solicito|tengo cliente|tengo un cliente|tenemos cliente|cliente interesad|para cliente|clientes? listos?|clientes? para (?:alquilar|comprar)|difusion de clientes|necesidades? de clientes?)/i;
  const SALE_RX = /venta|vendo|se vende|vende\b|compra|comprar|inversion|precio de venta|remate/i;
  const RENT_RX = /alquil|renta\b|rent\b|mensual|arriendo|arrendamiento|canon/i;
  const START_RX = /^(?:\d\s*[\u20e3.)-]|\d\ufe0f?\u20e3|busco|buscamos|se busca|busqueda|se vende|se alquila|vendo|alquilo|en venta|en alquiler|venta\b|alquiler\b|ofrezco|se ofrece|disponible|oportunidad|exclusiv|https?:\/\/|ph\b|apartamento|apto|casa\b|local\b|oficina|terreno|lote\b|galera|penthouse)/i;
  const START_EMOJI = /^\s*(\d\ufe0f?\u20e3|🅱|✅|♦|🔥|🛑|🏡|🏢|🐬|📍\s*(?:se|en)\b)/u;
  const MEDIA = '<Media omitted>';

  const SEP_RX = /^\s*[*_~]*\s*(?:[-–—_=~•·.⸻━─═]\s*){3,}[*_~]*\s*$/;
  const OPT_RX = /^(?:opci[oó]n|option|alternativa|cliente|propiedad|inmueble)\s*#?\s*\d+\b|^#\s*\d+\b|^\d{1,2}\s*[).:-]\s+\S/i;
  const PRE = '\u0000PRE\n';
  /* divide un mensaje en publicaciones: bloques, separadores, encabezados y, si un bloque ya tenía precio y recámaras, la siguiente lista es otra propiedad */
  function segments(text){
    text = norm(text).split(MEDIA).join('').trim(); if (!text) return [];
    const blocks = []; let cur = [], hard = false;
    for (const ln of text.split('\n')){
      if (!ln.trim() || SEP_RX.test(cleanLine(ln) ? ln : '---')){ if (cur.length){ blocks.push({lines: cur, hard}); cur = []; } hard = hard || SEP_RX.test(ln); if (SEP_RX.test(ln)) hard = true; continue; }
      if (!cur.length && blocks.length && !SEP_RX.test(ln)) { /* inicio de bloque */ }
      cur.push(ln);
      if (cur.length === 1) cur.hard = hard, hard = false;
    }
    if (cur.length) blocks.push({lines: cur, hard: cur.hard});
    for (const b of blocks) if (b.lines.hard !== undefined) b.hard = b.lines.hard;
    // 1) agrupar bloques en publicaciones
    let items = [];
    for (const b of blocks){
      const L = b.lines, first = stripAcc(cleanLine(L[0]).toLowerCase()), raw = norm(L[0]).trim();
      const isUrl = /^https?:\/\//.test(stripChars(raw, '* ')), prev = items.length ? items[items.length - 1].map(x => x.join('\n')).join('\n') : '';
      const bt = L.join('\n'), lbt = low(bt);
      // un bloque que solo trae operación y precio ("Alquiler $2,200", "Venta $405k") sigue siendo la misma propiedad
      const ident = RX_REC_ANY.test(lbt) || /\b(?:ph|p\.h)\b/.test(lbt) || zonesExplicit(bt).length > 0 || /apartamento|apto\b|casa\b|local\b|oficina|terreno|lote\b|galera|penthouse|edificio/.test(lbt);
      const opOnly = START_RX.test(first) && !ident && /^(?:se alquila|se vende|vendo|alquilo|en venta|en alquiler|venta\b|alquiler\b|disponible|oportunidad|exclusiv)/.test(first);
      const startsNew = b.hard || (START_RX.test(first) && !opOnly && !(isUrl && !/https?:\/\//.test(prev))) || OPT_RX.test(first) || (START_EMOJI.test(raw) && !opOnly) || (isUrl && /https?:\/\//.test(prev));
      const detailed = L.filter(ln => pricesOf(ln).length && RX_REC_ANY.test(low(ln)));
      if (detailed.length >= 2 && detailed.length >= L.length - 1){ for (const ln of L) items.push([[ln]]); continue; }
      const urlLines = L.filter(ln => /^\s*[*_]*https?:\/\//.test(ln));
      if (urlLines.length >= 2 && urlLines.length >= L.length - 1){ for (const ln of L) items.push([[ln]]); continue; }
      if (items.length && !startsNew) items[items.length - 1].push(L); else items.push([L]);
    }
    // 2) un ítem con varias propiedades adentro: se corta cuando ya había precio y recámaras y empieza otra
    const isStart = ln => { const f = stripAcc(cleanLine(ln).toLowerCase()), r = norm(ln).trim(); return START_RX.test(f) || OPT_RX.test(f) || START_EMOJI.test(r) || /^[*\s]*[♦✅🔑•▪️➡️🔹🔸💧🌻🎻🏡🏢🐬✨📌]/u.test(r) || isTitleLine(r); };
    const isTitleLine = r => /^[-•\s]*\*[^*\d]{3,40}\*\s*:?\s*$/.test(r) && r.split(/\s+/).length <= 6 || /^[-•*\s]*(?:ph|p\.h\.?)\s+\S/i.test(r);
    const out = [];
    for (const it of items){
      const all = low(it.map(L => L.join('\n')).join('\n'));
      if (pricesOf(all).length < 2 || (all.match(new RegExp('\\d\\s*(?:' + REC_U + ')', 'g')) || []).length < 2){ out.push(it); continue; }
      // unidades: bloques, y dentro de bloques largos, desde cada línea que empieza una publicación
      const units = [];
      for (const L of it){
        const t = L.join('\n');
        if (pricesOf(t).length >= 2 && L.length > 2){ let cur = []; for (const ln of L){ if (cur.length && isStart(ln)){ units.push(cur); cur = []; } cur.push(ln); } if (cur.length) units.push(cur); }
        else units.push(L);
      }
      let curI = [], hp = false, hr = false;
      for (const U of units){
        const t = U.join('\n'), bp = pricesOf(t).length > 0, br = RX_REC_ANY.test(low(t));
        if (curI.length && hp && hr && (br || (bp && isTitleLine(norm(U[0]).trim())))){
          const carry = []; while (curI.length > 1){ const last = curI[curI.length - 1], lt = last.join('\n'); if (!pricesOf(lt).length && !RX_REC_ANY.test(low(lt)) && isStart(last[0])) carry.unshift(curI.pop()); else break; }
          out.push(curI); curI = carry; hp = hr = false;
        }
        curI.push(U); hp = hp || bp; hr = hr || br;
      }
      if (curI.length) out.push(curI);
    }
    // 3) restos cortos (firmas) se pegan al anterior
    const merged = [];
    for (const it of out){ const txt = it.map(L => L.join('\n')).join('\n\n');
      if (merged.length && txt.length < 25 && !/https?:\/\//.test(txt) && !pricesOf(txt).length) merged[merged.length - 1] += '\n' + txt; else merged.push(txt); }
    let res = merged.map(x => x.trim()).filter(Boolean);
    // 4) encabezado común (sin precio ni recámaras) cuando hay varias publicaciones: es contexto, no una publicación
    if (res.length > 1){
      const h = res[0];
      if (!pricesOf(h).length && !RX_REC_ANY.test(low(h)) && !/https?:\/\//.test(h)) res[0] = PRE + h;
      else {
        // el encabezado quedó pegado a la primera opción: separarlo si sus primeras líneas no tienen datos
        const bl = h.split('\n\n'); let k = 0;
        while (k < bl.length - 1 && !pricesOf(bl[k]).length && !RX_REC_ANY.test(low(bl[k])) && !/https?:\/\//.test(bl[k])) k++;
        if (k > 0) res.splice(0, 1, PRE + bl.slice(0, k).join('\n\n'), bl.slice(k).join('\n\n'));
      }
    }
    return res;
  }
  function wasiInfo(url){
    const u = stripAcc(url.toLowerCase());
    const m = /wasi\.co\/([a-z0-9-]+)-(venta|alquiler|venta-y-alquiler)-([a-z0-9-]+)\/(\d+)/.exec(u) || /inmo\.co\/([a-z0-9-]+)-(venta|alquiler)-([a-z0-9-]+)\/(\d+)/.exec(u);
    return m ? {slug_type: m[1], op: m[2].startsWith('venta') ? 'Venta' : 'Alquiler', slug_zone: m[3].replace(/-/g, ' '), id: m[4]} : null;
  }
  const BLD_RX = /\b(?:PH|Ph|ph|P\.H\.?)\s+([A-Za-zÁÉÍÓÚÑáéíóúñ0-9][\w&'.áéíóúñÁÉÍÓÚÑ]*(?:\s+(?!en\b|de\b|del\b|con\b|y\b|EN\b|DE\b|CON\b|Costa\b|COSTA\b|San\b|SAN\b|Punta\b)[A-ZÁÉÍÓÚÑ0-9][\w&'.áéíóúñÁÉÍÓÚÑ]*){0,2})/;
  function buildingOf(t){
    let m = null;
    for (const ln of t.split('\n').slice(0, 5)){ m = BLD_RX.exec(cleanLine(ln)); if (m) break; }
    if (m){ const name = stripChars(m[1].replace(/\s+\d+\s*(?:m2|m²|mts2?|mt2|m)?$/i, ''), ' .,|'); if (['en', 'de', 'con', 'amoblado', 'disponible'].includes(low(name))) return null; return 'PH ' + title(name); }
    const m2 = /^([A-Z][A-Z0-9 ]{2,30}?)\s+ID\d+/.exec(cleanLine(t.split('\n')[0]));
    return m2 ? title(m2[1]) : null;
  }
  function titleOf(t){
    for (const ln of norm(t).split('\n')){ const c = cleanLine(ln);
      if (c.length >= 6 && !/^https?:\/\//.test(c) && !/^(caracter|detalles|informaci|descripci|amenidades|ubicaci)/i.test(c)) return c.slice(0, 110); }
    return cleanLine(t).slice(0, 110);
  }
  function extractItem(txt, ctx){
    const l = low(txt), urls = norm(txt).match(URL_RX) || [];
    let w = null; for (const u of urls){ w = wasiInfo(u); if (w) break; }
    let isDem = DEMAND_RX.test(l) || !!ctx.demand;
    if (isDem && !ctx.demand && /que buscan|quienes buscan|ideal para/.test(l) && !/\bbusco\b|se busca|busqueda/.test(l)) isDem = false;
    const sale = SALE_RX.test(l), rent = RENT_RX.test(l);
    let op;
    if (w) op = w.op;
    else if (sale && rent) op = !isDem ? 'Venta/Alquiler' : (/compra|comprar|venta/.test(l) && !/busco alquiler|alquiler/.test(l.slice(0, 60)) ? 'Venta' : 'Alquiler');
    else if (sale) op = 'Venta'; else if (rent) op = 'Alquiler'; else op = ctx.op || null;
    const priceTxt = txt.split('\n').filter(ln => !/ingreso|salario|sueldo|devenga|\bgana\b|dep[oó]sito|mantenimiento|cuota|abono|comisi[oó]n|garant[ií]a/i.test(ln) || /presupuesto|precio|hasta|canon|renta|alquiler\s*[:$]|venta\s*[:$]/i.test(ln)).join('\n');
    const prices = pricesOf(priceTxt); let price = null, priceRent = null;
    if (prices.length){
      if (isDem) price = Math.max(...prices);
      else {
        const mm = /precio[^\n$\d]{0,25}\$?\s*(\d[\d.,]*)\s*(k|mm|mil)?/.exec(stripAcc(norm(txt)).toLowerCase());
        price = mm ? parseAmount(stripChars(mm[1], '.,'), mm[2]) : prices[0];
        if (!price || price < 100) price = prices[0];
        if (op === 'Venta/Alquiler' && prices.length >= 2){ const big = prices.filter(p => p >= 20000), small = prices.filter(p => p < 20000); if (big.length && small.length){ price = big[0]; priceRent = small[0]; } }
      }
    }
    if (!op && price) op = price >= 30000 ? 'Venta' : 'Alquiler';
    if (op === 'Alquiler' && price && price >= 60000) op = 'Venta';           // nadie alquila en $60,000 al mes: es venta
    else if (op === 'Alquiler' && price && price > 25000) price = null;      // dato dudoso
    if (op === 'Venta' && price && price < 10000 && !/\d\s*(?:k|mil|mm)\b/i.test(txt)) { if (!isDem && !priceRent) { op = 'Alquiler'; } }
    const [rmin, rmax] = numRange(l, RX_REC1, RX_REC2), [pmin] = numRange(l, RX_PARK1, RX_PARK2), m2s = m2Of(l);
    let zones = zonesOf(txt); if (!zones.length) zones = [...(ctx.zones || [])];
    if (w && !zones.length){ zones = zonesOf(w.slug_zone); if (!zones.length) zones = [title(w.slug_zone)]; }
    const ty = typeOf(txt, w ? w.slug_type : '') || ctx.type || null;
    let furnished = null;
    if (/amoblad|amueblad|amablad|furnished|full equipado|totalmente equipado/.test(l)) furnished = 'Amoblado';
    if (/linea blanca|l\/b|lb\b|l\/bl|sin muebles|vacio|vacia|semi ?amoblad/.test(l)) furnished = furnished ? 'Amoblado o L. blanca' : 'Línea blanca';
    if (!furnished && ctx.furnished) furnished = ctx.furnished;
    return { kind: isDem ? 'Demanda' : 'Oferta', op, type: ty, zones, building: buildingOf(txt), price, price_rent: priceRent,
      beds_min: rmin, beds_max: rmax, baths: bathsOf(l), parking: pmin,
      m2: m2s.length ? (ty === 'Terreno/Lote' ? Math.max(...m2s) : m2s[0]) : null,
      furnished, pets: /mascota|perr|gato|pet/.test(l), urls, listing_id: w ? w.id : null, title: titleOf(txt), text: norm(txt).trim() };
  }
  const isNoise = txt => { const l = low(txt).trim(); return !l || l === 'this message was deleted' || l === 'se elimino este mensaje' || l === 'waiting for this message' || l === 'esperando este mensaje' || l === 'null' || (l.length < 12 && !/https?:\/\//.test(l)); };

  // ------------------------------------------------------------ lectura del chat
  const HDRS = [
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),? (\d{1,2}:\d{2}(?::\d{2})?\s?[APap]\.?\s?[Mm]\.?) - (.*)$/,
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),? (\d{1,2}:\d{2}(?::\d{2})?) - (.*)$/,
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),? (\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap]\.?\s?[Mm]\.?)?)\] (.*)$/,
  ];
  const MEDIA_RX = /<Media omitted>|<Multimedia omitido>|<multimedia omitido>|<adjunto: [^>]*>|\S+\.(?:jpg|jpeg|png|webp|mp4|opus|pdf) \((?:file attached|archivo adjunto)\)|(?:imagen|video|audio|sticker|GIF|documento) omitid[oa]/g;
  const IMG_RX = /([\w.-]+\.(?:jpe?g|png|webp)) \((?:file attached|archivo adjunto)\)|<(?:attached|adjunto): ([^>]+?\.(?:jpe?g|png|webp))>/gi;
  const grabImgs = (s, arr) => { for (const m of s.matchAll(IMG_RX)){ const n = (m[1] || m[2]).trim(); if (!/^STK-/i.test(n) && !arr.includes(n)) arr.push(n); } };
  function parseChat(raw){
    const lines = raw.replace(/\r/g, '').replace(/\u202f/g, ' ').replace(/\u200e/g, '').split('\n');
    const firsts = [];
    for (const ln of lines.slice(0, 4000)) for (const rx of HDRS){ const m = rx.exec(ln); if (m){ firsts.push(m[1].split('/').map(Number)); break; } }
    const dayfirst = firsts.some(f => f[0] > 12) && !firsts.some(f => f[1] > 12);
    const msgs = []; let cur = null; const names = [];
    for (const ln of lines){
      let m = null; for (const rx of HDRS){ m = rx.exec(ln); if (m) break; }
      if (m){
        let [, d, t, rest] = m; let [a, b, y] = d.split('/').map(Number); if (y < 100) y += 2000;
        const [mo, da] = dayfirst ? [b, a] : [a, b];
        let tt = t.toLowerCase().replace(/[.\s]/g, ''); const pm = tt.includes('pm'), am = tt.includes('am');
        tt = tt.replace('am', '').replace('pm', ''); let [h, mi] = tt.split(':').map(Number);
        if (pm && h < 12) h += 12; if (am && h === 12) h = 0;
        if (!(mo >= 1 && mo <= 12 && da >= 1 && da <= 31)){ if (cur) cur.text += '\n' + ln; continue; }
        if (cur) msgs.push(cur);
        const dt = `${y}-${String(mo).padStart(2, '0')}-${String(da).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
        const sep = rest.indexOf(': ');
        if (sep > 0 && sep < 80){ const body = rest.slice(sep + 2), images = []; grabImgs(body, images);
          cur = {dt, author: rest.slice(0, sep).replace(/^~\s*/, '').trim(), text: body.replace(MEDIA_RX, MEDIA), images}; }
        else { cur = {dt, author: null, text: rest, system: true};
          const g = /(?:created group|creó el grupo|cre[oó] el grupo|changed the group name (?:from ".*?" )?to|cambi[oó] el nombre (?:del grupo )?(?:de ".*?" )?a) "(.+)"/i.exec(rest); if (g) names.push(g[1]); }
      } else if (cur){ if (cur.images) grabImgs(ln, cur.images); cur.text += '\n' + ln.replace(MEDIA_RX, MEDIA); }
    }
    if (cur) msgs.push(cur);
    return {msgs, names};
  }

  // ------------------------------------------------------------ nombre de grupo
  function groupFromFile(fileName){
    let n = fileName.split('/').pop().replace(/\.(txt|zip)$/i, '');
    n = n.replace(/^[0-9a-f]{6,}-/i, '');
    n = n.replace(/\s*\(\d+\)\s*$/, '').replace(/\s*\(\d+\)\s*$/, '');
    n = n.replace(/^(?:WhatsApp[ _]Chat[ _](?:with|con)|Chat[ _]de[ _]WhatsApp[ _]con)[ _]/i, '');
    return n.replace(/_+/g, ' ').trim();
  }
  const groupKey = name => stripAcc(String(name || '').toLowerCase()).replace(/\(\d+\)/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

  // ------------------------------------------------------------ firma del broker
  const COMPANY_RX = /(realty|real estate|bienes ra[ií]ces|inmobiliaria|properties|propiedades|group|grupo|keller|\bkw\b|century ?21|re\/?max|coldwell|sotheby|broker|corredor|rent(?:s|als)?\b|homes?\b|asesor)/i;
  const LIC_RX = /\b(?:PN|P\.N\.|Lic\.?\s*PN|licencia(?:\s+n[o°º.]*)?)\s*[-#:.]?\s*(\d{3,5})\b/i;
  const NAME_RX = /^(?:Lic\.?\s+|Licda\.?\s+|Ing\.?\s+|Arq\.?\s+)?([A-ZÁÉÍÓÚÑ][a-záéíóúñ.]+(?:\s+(?:de\s+|del\s+)?[A-ZÁÉÍÓÚÑ][a-záéíóúñ.]+){1,3})$/;
  const NOT_NAME = /(precio|presupuesto|alquiler|venta|busco|contacto|cliente|costa|\bsan |punta|santa|calle|torre|vista|avenida|bella|obarrio|paitilla|cangrejo|panam|linea|amoblad|gracias|saludos|disponible|whatsapp|\binfo\b|ubicaci|parking|piscina|\barea\b|área|perfil|favor|recamar|baño|enviar|interesad|\bpet\b|mascota|balboa|marbella|dorado|clayton|albrook|amador|casco|\bel |\bla |\blos |\blas |disponib|inmediat|cocina|abiert|familiar|unifamil|distribuc|detallad|\bplaza\b|generador|elevador|express|premium|locaci|\btipo\b|cuarto|servicio|terraza|balc|jard|patio|lavand|amenid|seguridad|nuevo|nueva|exclusiv|oportunidad|remodel|equipad|cerca|frente|edificio|residenc|apartament|oficina|\blocal\b|\bpiso\b|\balto\b|ocean|view|mar\b|ciudad|\bsala\b|comedor|estudio|den\b|gimnasio|\blindo\b|hermos|amplio|amplia|moderno|pareja|familia|empresa|ejecutiv|perro|gato|ver\b|visita|contrato|deposito|mes\b|meses|año)/i;
  const isContact = l => { PHONE_RX.lastIndex = 0; return PHONE_RX.test(l) || LIC_RX.test(l) || /@|wa\.me|wa\.link/.test(l); };
  const INTRO_RX = /(?:^|[\s,.!])(?:soy|les saluda|le saluda|mi nombre es|atentamente|atte\.?|cordialmente|saludos cordiales)\s*[:,-]?\s*(?:la |el )?(?:lic\.?\s+|licda\.?\s+)?([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})/;
  const okName = n => n && NAME_RX.test(n) && !NOT_NAME.test(stripAcc(n)) && !/\b(?:preaprobado|listo|inf|privado|contactar|con|al|brp|whats|dm|bienes|raices|realty|group|properties|inmobiliaria|tengo|video|videos|fotos|foto|precio|venta|alquiler|hoy|nuevo|nueva|cliente|clientes|gracias)\b/i.test(n) && n.length <= 40;
  /* todos los pares nombre-teléfono de un mensaje (sirve para nombrar a otros brokers que aparecen como contacto) */
  function namePhonePairs(text){
    const lines = norm(text).split(MEDIA).join('').split('\n').map(cleanLine).filter(Boolean), out = [];
    lines.forEach((l, i) => {
      PHONE_RX.lastIndex = 0; const pm = PHONE_RX.exec(l); if (!pm) return;
      const phone = pm[1] + pm[2];
      let before = stripChars(l.slice(0, pm.index).replace(/^(?:contacto|contactar a|contactar|llamar a|escribir a|info|whatsapp|cel|tel|telefono|teléfono|movil|móvil|agente|asesor|asesora|broker)\s*[:.\-]?\s*/i, '').replace(/\s*(?:\+?507)?\s*$/, ''), ' -|,:.');
      before = before.replace(/\s+(?:Lic|Licda|Lcda)\.?$/i, '');
      const cand = /^[A-ZÁÉÍÓÚÑ .]+$/.test(before) && /\s/.test(before) && before.length <= 32 ? title(before) : before;
      if (okName(cand)) { out.push([phone, cand, 3]); return; }
      const prev = lines[i - 1] && stripChars(lines[i - 1].replace(/\s+(?:Lic|Licda|Lcda)\.?$/i, ''), ' -|,:.');
      const pc = prev && /^[A-ZÁÉÍÓÚÑ .]+$/.test(prev) && /\s/.test(prev) && prev.length <= 32 ? title(prev) : prev;
      if (okName(pc)) out.push([phone, pc, 2]);
    });
    return out;
  }
  function signature(text){
    const t = norm(text).split(MEDIA).join('');
    const tail = t.split('\n').map(cleanLine).filter(Boolean).slice(-7);
    const out = {name: null, company: null, license: null, phones: [], instagram: null, pairs: namePhonePairs(text)};
    { const im = INTRO_RX.exec(norm(text)); if (im && okName(im[1])) out.intro = im[1]; }
    const m = LIC_RX.exec(tail.join(' ')); if (m) out.license = 'PN-' + m[1];
    for (const mm of t.matchAll(PHONE_RX)){ const p = `+507 ${mm[1]}-${mm[2]}`; if (!out.phones.includes(p)) out.phones.push(p); }
    const ig = /@([A-Za-z0-9_.]{4,30})/.exec(tail.join(' ')); if (ig && !/(\.com|gmail|hotmail)$/i.test(ig[1])) out.instagram = '@' + ig[1];
    const n = tail.length;
    for (let i = n - 1; i >= 0; i--){
      const l = tail[i];
      let l2 = stripChars(l.replace(/\s*(?:\+?507)?[\s-]*6\d{3}[\s.-]?\d{4}.*$/, ''), ' -|,');
      l2 = stripChars(l2.replace(/\s*[-|,]?\s*(?:Lic\.?\s*)?PN[\s-]*\d+.*$/i, ''), ' -|,');
      const near = i === n - 1 || isContact(l) || (i + 1 < n && isContact(tail[i + 1])) || (i > 0 && isContact(tail[i - 1]));
      if (!near || !l2 || l2.includes(':')) continue;
      if (!out.company && COMPANY_RX.test(l2) && l2.length <= 40 && !/\$|\d{3,}/.test(l2) && !/busco|alquil[oa]|vend[oe]|\bse\b|tipo|residencial|disponib/i.test(l2)){ out.company = l2; continue; }
      // nombres en MAYÚSCULAS ("YARABI MARTINEZ") -> "Yarabi Martinez"
      l2 = l2.replace(/\s+(?:Lic|Licda|Lcda)\.?$/i, '').replace(/\.$/, '');
      const cand = /^[A-ZÁÉÍÓÚÑ .]+$/.test(l2) && /\s/.test(l2) && l2.length <= 32 ? title(l2) : l2;
      if (!out.name && okName(cand)){
        out.name = cand;
        // ¿el nombre va pegado a un teléfono? (misma línea o la de al lado) -> firma fuerte
        for (const ln of [l, tail[i + 1], tail[i - 1]]){ if (!ln) continue; PHONE_RX.lastIndex = 0; const pm = PHONE_RX.exec(ln); if (pm){ out.namePhone = pm[1] + pm[2]; break; } }
      }
    }
    return out;
  }

  // ------------------------------------------------------------ por grupo
  const SOCIAL = /wa\.me|wa\.link|instagram|facebook|tiktok|linktr|x\.com|youtu|chat\.whatsapp/i;
  const mins = dt => Date.parse(dt + ':00Z') / 6e4;
  const imgOnly = m => m.text.includes(MEDIA) && !m.text.split(MEDIA).join('').trim();
  function extractGroup(gname, msgs, flyerText = {}){
    const items = [], info = [], flyers = [], stats = {mensajes: 0, solo_imagen: 0, ruido: 0, sin_datos: 0, items: 0, fotos: 0};
    const real = msgs.filter(m => !m.system && m.author).map(m => ({...m, images: [...(m.images || [])]}));
    // 1) foto suelta + texto del mismo broker con 3 minutos o menos de diferencia = misma publicación
    real.forEach((m, i) => {
      if (!m.images.length || !imgOnly(m)) return;
      const read = m.images.map(n => flyerText[n]).find(Boolean);
      if (read){ m.text = read; m.fromFlyer = true; return; }
      let best = null;
      for (let j = Math.max(0, i - 12); j < Math.min(real.length, i + 13); j++){
        const o = real[j]; if (j === i || o.author !== m.author || imgOnly(o) || isNoise(o.text)) continue;
        const d = Math.abs(mins(o.dt) - mins(m.dt)); if (d <= 3 && (!best || d < best[0] || (d === best[0] && j > i))) best = [d, o];
      }
      if (best){ best[1].images.push(...m.images.filter(n => !best[1].images.includes(n))); m.absorbed = true; }
    });
    for (const m of real){
      stats.mensajes++;
      const t = m.text, author = m.author;
      stats.fotos += m.images.length && !m.absorbed ? m.images.length : 0;
      if (!m.fromFlyer) info.push({author, dt: m.dt, sig: signature(t), group: gname, text: t});
      if (imgOnly(m)){ stats.solo_imagen++; if (!m.absorbed && m.images.length) flyers.push({kind: 'Flyer', images: m.images, author, dt: m.dt, date: m.dt.slice(0, 10), group: gname}); continue; }
      if (isNoise(t)){ stats.ruido++; continue; }
      const segs = segments(t), lt = low(t);
      const ctx = {demand: /^\W*(busco|busqueda|se busca|buscamos)/.test(cleanLine(lt.split('\n')[0]).toLowerCase()) || (DEMAND_RX.test(lt.slice(0, 80)) && !/que buscan/.test(lt.slice(0, 120)))};
      const h = lt.slice(0, 120);
      ctx.op = RENT_RX.test(h) && !SALE_RX.test(h) ? 'Alquiler' : SALE_RX.test(h) && !RENT_RX.test(h) ? 'Venta' : null;
      const pre = segs[0] && segs[0].startsWith(PRE) ? segs.shift().slice(PRE.length) : null;
      ctx.type = pre ? typeOf(pre) : segs.length ? typeOf(segs[0].split('\n')[0]) : null;
      ctx.zones = pre ? zonesOf(pre) : segs.length > 1 && !pricesOf(segs[0]).length ? zonesOf(segs[0]) : [];
      if (pre && DEMAND_RX.test(low(pre))) ctx.demand = true;
      ctx.preTitle = pre && /busc|alquil|venta|vend|client|ofrezco|ofrecemos|disponible|requer|necesit/i.test(low(pre)) ? cleanLine(pre.split('\n').find(l => cleanLine(l).length >= 4) || '') : null;
      if (pre && !ctx.op){ const lp = low(pre); ctx.op = RENT_RX.test(lp) && !SALE_RX.test(lp) ? 'Alquiler' : SALE_RX.test(lp) && !RENT_RX.test(lp) ? 'Venta' : null; }
      if (pre && !ctx.furnished) ctx.furnished = /amoblad|amueblad/.test(low(pre)) ? 'Amoblado' : null;
      let n = 0;
      for (const s of segs){
        const it = extractItem(s, ctx);
        it.urls = it.urls.filter(u => !SOCIAL.test(u));
        const body = norm(s).split('\n').filter(l => { const c = cleanLine(l); return c && !/^https?:\/\//.test(c); });
        if (body.length <= 1 && !it.price && !it.urls.length) continue;
        if (it.kind === 'Demanda' && !(it.price || it.zones.length || it.beds_min != null || it.m2)) continue;
        const useful = it.price || it.urls.length || it.beds_min || it.m2 || (it.kind === 'Demanda' && (it.zones.length || it.type));
        if (!useful) continue;
        if (!it.type) it.type = typeOf(t.slice(0, 200));
        if (/^(?:se\s+)?(?:alquiler|alquila|alquilo|ventas?|vendo|vende|busco|buscamos|ofrezco|ofrecemos|disponible|oportunidad|exclusiva|nuevo|nueva|ganga|urgente|en alquiler|en venta)\s*[:!.]?$/i.test(stripAcc(it.title).trim()) || it.title.length < 5){
          const z = it.zones[0], op = it.op === 'Venta' ? 'en venta' : it.op === 'Alquiler' ? 'en alquiler' : '';
          it.title = [it.building || it.type || 'Propiedad', op, z && '· ' + z].filter(Boolean).join(' ');
        }
        if (ctx.preTitle && segs.length > 1 && it.title.length < 40 && !low(it.title).includes(low(ctx.preTitle))) it.title = (ctx.preTitle + ' · ' + it.title).slice(0, 110);
        if (it.kind === 'Demanda' && !it.beds_min && /loft|estudio|monoambiente/.test(low(s))){ it.beds_min = 0; it.beds_max = 1; }
        Object.assign(it, {dt: m.dt, date: m.dt.slice(0, 10), author, group: gname, images: n === 0 ? m.images : [], from_flyer: !!m.fromFlyer});
        items.push(it); n++;
      }
      if (!n) stats.sin_datos++;
    }
    stats.items = items.length;
    return {items, info, stats, flyers};
  }

  // ------------------------------------------------------------ identidad
  const isPhone = a => /^\+?\d[\d\s()-]{6,}$/.test(a || '');
  const phoneKey = p => p.replace(/\D/g, '').slice(-8);
  function identities(info){
    const by = new Map(); for (const mi of info){ if (!by.has(mi.author)) by.set(mi.author, []); by.get(mi.author).push(mi); }
    const alias = {};
    for (const [a, ms] of by){
      if (isPhone(a)){ alias[a] = 'p' + phoneKey(a); continue; }
      const c = mostCommon(counter(ms.flatMap(mi => mi.sig.phones.slice(0, 1))));
      if (c.length && c[0][1] >= Math.max(2, 0.3 * ms.length)){ alias[a] = 'p' + phoneKey(c[0][0]); continue; }
      alias[a] = 'n' + hash(low(a)).slice(0, 8);
    }
    return alias;
  }
  /* qué herramienta revela cada link: [regex del dominio, herramienta, ¿es su sitio web?] */
  const TOOLS = [
    [/(^|\.)wasi\.co$/, 'Wasi', false], [/\.inmo\.co$/, 'Wasi', true], [/(^|\.)encuentra24\.com$/, 'Encuentra24', false],
    [/\.easybroker\.com$/, 'EasyBroker', true], [/^easybroker\.com$/, 'EasyBroker', false], [/(^|\.)compreoalquile\.com$/, 'Compreoalquile', false],
    [/(^|\.)mlsacobir\.com$|(^|\.)acobir\.com$/, 'MLS ACOBIR', false], [/remax/, 'RE/MAX', false], [/\.kw\.com$/, 'Keller Williams', true],
    [/alobroker/, 'Alobroker', false], [/propertylinkcrm\.com$/, 'PropertyLink CRM', false], [/icasas\.com\.pa$/, 'iCasas', false], [/flexmls\.com$/, 'FlexMLS', false],
    [/(^|\.)instagram\.com$/, 'Instagram', false], [/(^|\.)facebook\.com$|fb\.me$/, 'Facebook', false], [/tiktok\.com$/, 'TikTok', false],
    [/youtube\.com$|youtu\.be$/, 'YouTube', false], [/linkedin\.com$|lnkd\.in$/, 'LinkedIn', false], [/^x\.com$|twitter\.com$/, 'X', false],
    [/linktr\.ee$/, 'Linktree', false], [/walink\.co$|wa\.link$/, 'WaLink', false], [/canva\.(site|com)$/, 'Canva', false],
  ];
  const IGNORE_DOM = /(^|\.)(wa\.me|whatsapp\.com|bit\.ly|share\.google|google\.com|goo\.gl|forms\.gle|waze\.com|chatgpt\.com|openai\.com|qrcodechimp\.com|gofund\.me|gob\.pa|supabase\.co|workers\.dev|tinyurl\.com|wetransfer\.com|dropbox\.com|icloud\.com|apple\.com|zoom\.us|calendly\.com)$/;
  function toolsOf(texts){
    const tools = new Map(), sites = new Map();
    for (const t of texts) for (const m of norm(t).matchAll(/https?:\/\/([^\/\s?#*]+)[^\s*]*/gi)){
      const url = m[0].replace(/[).,]+$/, ''), dom = m[1].toLowerCase().replace(/^www\./, '');
      if (IGNORE_DOM.test(dom)) continue;
      const hit = TOOLS.find(([rx]) => rx.test(dom));
      if (hit){ const k = hit[1]; const e = tools.get(k) || {tool: k, n: 0, url}; e.n++; tools.set(k, e); if (hit[2]) sites.set(dom, (sites.get(dom) || 0) + 1); }
      else { const e = tools.get('Sitio web') || {tool: 'Sitio web', n: 0, url}; e.n++; tools.set('Sitio web', e); sites.set(dom, (sites.get(dom) || 0) + 1); }
    }
    const ig = new Set(); for (const t of texts) for (const m of norm(t).matchAll(/(?:^|\s)@([A-Za-z0-9_.]{4,30})\b/g)) if (!/\.(com|net)$/i.test(m[1]) && !/^\d+$/.test(m[1])) ig.add(m[1]);
    if (ig.size && !tools.has('Instagram')) tools.set('Instagram', {tool: 'Instagram', n: ig.size, url: 'https://instagram.com/' + [...ig][0]});
    return {tools: [...tools.values()].sort((a, b) => b.n - a.n), sites: [...sites.entries()].sort((a, b) => b[1] - a[1]).map(([d]) => d)};
  }
  const ROLE_LABEL = {ofrece: 'Tiene propiedades', busca: 'Tiene clientes', mixto: 'Propiedades y clientes', poco: 'Poca actividad'};
  const CLOSE_OFF = /^(?:ya\s+)?(alquilad[oa]|vendid[oa]|rentad[oa]|ya no (?:esta|se encuentra) disponible|no disponible|fuera del mercado|reservad[oa])\b(?!\s+(?:hasta|en\s+\$|actualmente|con))/;
  const CLOSE_DEM = /^(?:ya\s+)?(cliente (?:ya )?(?:resuelto|cerrado|ubicado)|ya (?:consegui|conseguimos|cerramos|se cerro)|busqueda cerrada|ya no busco|gracias,? ya (?:cerre|conseguimos))/;

  /* misma persona, misma búsqueda, publicada otra vez con 7 días o menos de diferencia -> una sola */
  function sameAsk(a, b){
    if (a.broker !== b.broker || a.op !== b.op) return false;
    if (a.type && b.type && a.type !== b.type) return false;
    if (!!a.price !== !!b.price || (a.price && Math.abs(a.price - b.price) > 0.15 * Math.max(a.price, b.price))) return false;
    if ((a.beds_min == null) !== (b.beds_min == null)) return false;
    if (a.beds_min != null && ((a.beds_max ?? a.beds_min) < b.beds_min || (b.beds_max ?? b.beds_min) < a.beds_min)) return false;
    if (a.zones.length || b.zones.length){ if (!a.zones.some(z => b.zones.includes(z))) return false; }
    return true;
  }
  function mergeRepeats(list){
    list.sort((a, b) => a.first_seen < b.first_seen ? -1 : a.first_seen > b.first_seen ? 1 : 0);
    const byB = new Map(), out = [];
    for (const d of list){
      const cs = byB.get(d.broker) || []; byB.set(d.broker, cs);
      const c = cs.find(c => sameAsk(c, d) && daysDiff(c.last_seen, d.first_seen) <= 7);
      if (!c){ cs.push(d); out.push(d); continue; }
      c.times += d.times; c.post_dates = [...new Set([...c.post_dates, ...d.post_dates])].sort();
      c.groups = [...new Set([...c.groups, ...d.groups])].sort();
      if (d.last_seen >= c.last_seen){ Object.assign(c, {last_seen: d.last_seen, last_dt: d.last_dt, title: d.title, text: d.text, price: d.price, zones: d.zones.length ? d.zones : c.zones}); }
      c.images = [...new Set([...(d.images || []), ...(c.images || [])])].slice(0, 8);
      c.merged = (c.merged || 1) + 1;
    }
    return out;
  }

  /* ¿le sirve esta propiedad a este cliente? -> {score, gap, price} o null.  opts.anyDate: ignorar fechas (búsqueda directa) */
  function matchScore(q, o, opts = {}){
    if (!q.op || !q.price) return null;
    if (!(o.op === q.op || o.op === 'Venta/Alquiler')) return null;
    if (!opts.anyDate && (o.valid_until < q.first_seen || o.first_seen > q.valid_until)) return null;
    if (o.broker === q.broker) return null;
    if (q.type && o.type && q.type !== o.type) return null;
    const budget = q.price;
    let price = o.op === 'Venta/Alquiler' && q.op === 'Alquiler' ? o.price_rent : o.price;
    if (o.op === 'Venta/Alquiler' && q.op === 'Alquiler' && !o.price_rent && price && price > 30000) return null;
    if (!price || price > budget * 1.1 || price < budget * (opts.minRatio ?? 0.55)) return null;
    let score = 50;
    if (q.zones.length){ if (!o.zones.length || !q.zones.some(z => o.zones.includes(z))) return null; score += 20; } else score -= 15;
    if (q.beds_min != null && o.beds_min){ if ((o.beds_max || 0) < q.beds_min || (q.beds_max != null && o.beds_min > q.beds_max + 1)) return null; score += 15; }
    else if (q.beds_min) score -= 10;
    if (q.furnished === 'Amoblado'){ if (o.furnished === 'Amoblado') score += 10; else if (o.furnished === 'Línea blanca') return null; }
    if (q.m2 && o.m2 && ['Apartamento', 'Casa', null].includes(q.type) && o.m2 < 0.85 * q.m2) return null;
    if (q.furnished === 'Línea blanca' && o.furnished === 'Línea blanca') score += 5;
    if (price <= budget) score += 5;
    const gap = daysDiff(q.last_seen, o.last_seen);
    if (!opts.anyDate) score -= Math.min(15, Math.floor(Math.abs(gap) / 7));
    return {score: Math.min(score, 100), gap, price};
  }
  /* texto de un anuncio (pegado por ti) -> datos */
  /* texto pegado por ti (uno o varios anuncios, o links) -> lista de publicaciones */
  function parseListings(text){
    const t = norm(String(text || '')).trim(); if (!t) return [];
    let segs = segments(t); if (!segs.length) return [];
    const pre = segs[0].startsWith(PRE) ? segs.shift().slice(PRE.length) : null;
    const lt = low(t), h = lt.slice(0, 120);
    const ctx = {demand: /^\W*(busco|busqueda|se busca|buscamos)/.test(cleanLine(lt.split('\n')[0]).toLowerCase()) || (DEMAND_RX.test(lt.slice(0, 80)) && !/que buscan/.test(lt.slice(0, 120))) || (!!pre && DEMAND_RX.test(low(pre))),
      op: RENT_RX.test(h) && !SALE_RX.test(h) ? 'Alquiler' : SALE_RX.test(h) && !RENT_RX.test(h) ? 'Venta' : null,
      type: pre ? typeOf(pre) : typeOf(segs[0].split('\n')[0]), zones: pre ? zonesOf(pre) : [], furnished: pre && /amoblad/.test(low(pre)) ? 'Amoblado' : null};
    return segs.map(sg => {
      const it = extractItem(sg, ctx);
      it.urls = (sg.match(URL_RX) || []).filter(u => !SOCIAL.test(u));
      if (!it.type) it.type = typeOf(sg.slice(0, 200)) || ctx.type;
      const slug = it.urls.map(u => { try { return decodeURIComponent(u); } catch (e) { return u; } }).join(' ').toLowerCase().replace(/https?:\/\/[^/]+/g, ' ').replace(/[-_/?=&.]+/g, ' ');
      if (slug.trim()){
        if (!it.zones.length) it.zones = zonesOf(slug);
        if (!it.type) it.type = typeOf(slug.replace(/apartamentos/g, 'apartamento').replace(/casas/g, 'casa').replace(/locales/g, 'local').replace(/oficinas/g, 'oficina').replace(/terrenos/g, 'terreno'));
        if (!it.op) it.op = /alquiler|rent/.test(slug) ? 'Alquiler' : /venta|sale|compra/.test(slug) ? 'Venta' : null;
        if (it.beds_min == null){ const m = /\b(\d)\s*(?:recamaras?|habitaciones?|rec|hab|dormitorios?)\b/.exec(slug); if (m) it.beds_min = it.beds_max = +m[1]; }
        if (!it.m2){ const m = /\b(\d{2,4})\s*(?:m2|mts|metros)\b/.exec(slug); if (m) it.m2 = +m[1]; }
        if (!it.building){ const m = /\bph\s+([a-z0-9]+(?:\s+[a-z0-9]+)?)/.exec(slug); if (m && !/^(en|de|del)$/.test(m[1])) it.building = 'PH ' + title(m[1]); }
      }
      if (/^https?:/.test(it.title) || !it.title) it.title = [it.building, it.type, it.op && 'en ' + it.op.toLowerCase(), it.zones[0] && '· ' + it.zones[0]].filter(Boolean).join(' ') || 'Propiedad';
      return it;
    }).filter(it => it.price || it.urls.length || it.beds_min != null || it.m2 || it.zones.length);
  }
  const parseListing = text => parseListings(text)[0] || null;
  const FAR = '2999-12-31';
  /* tus propiedades y clientes -> mismo formato que lo de los grupos */
  function ownItems(own, today){
    const offers = (own.offers || []).map(d => ({kind: 'Oferta', op: d.op || null, type: d.type || null, zones: d.zones || [], building: d.building || null, price: +d.price || null, price_rent: +d.price_rent || null,
      beds_min: d.beds_min ?? null, beds_max: d.beds_max ?? d.beds_min ?? null, baths: d.baths ?? null, parking: d.parking ?? null, m2: +d.m2 || null, furnished: d.furnished || null, pets: false,
      urls: d.urls || [], listing_id: null, title: d.title || [d.type, d.building, (d.zones || [])[0]].filter(Boolean).join(' · ') || 'Mi propiedad', text: d.text || '', broker: 'yo', groups: ['Mis propiedades'],
      first_seen: (d.createdAt || today).slice(0, 10), last_seen: (d.updatedAt || d.createdAt || today).slice(0, 10), last_dt: (d.updatedAt || d.createdAt || today).slice(0, 16), times: 1, post_dates: [],
      price_history: [], price_drop: false, images: d.images || [], key: 'm' + d.id, own: true, own_id: d.id, closed: null, valid_until: FAR, active: true}));
    const demands = (own.demands || []).map(d => ({kind: 'Demanda', op: d.op || null, type: d.type || null, zones: d.zones || [], building: null, price: +d.price || null, price_rent: null,
      beds_min: d.beds_min ?? null, beds_max: d.beds_max ?? null, baths: null, parking: null, m2: +d.m2 || null, furnished: d.furnished || null, pets: !!d.pets, urls: [], listing_id: null,
      title: d.title || 'Mi cliente', text: d.notes || '', broker: 'yo', groups: ['Mis clientes'], first_seen: (d.createdAt || today).slice(0, 10), last_seen: (d.updatedAt || d.createdAt || today).slice(0, 10),
      last_dt: (d.updatedAt || d.createdAt || today).slice(0, 16), times: 1, post_dates: [], price_history: [], price_drop: false, images: [], key: 'c' + d.id, own: true, own_id: d.id, closed: null, valid_until: FAR, active: true}));
    return {offers, demands};
  }

  // ------------------------------------------------------------ todo junto
  /* groups: [{name, msgs}]  (msgs ya combinados y sin duplicados) */
  function build(groups, flyerText = {}, own = {}){
    let allItems = [], allInfo = [], allFlyers = []; const gmeta = [];
    FIXES = (own.zoneFixes || []).map(f => ({match: low(f.match || '').trim(), zone: f.zone})).filter(f => f.match.length >= 3 && f.zone);
    learnBuildings(groups.flatMap(g => g.msgs.filter(m => !m.system).map(m => m.text)));
    for (const f of FIXES) BZ[f.match] = f.zone;
    for (const g of groups){
      const r = extractGroup(g.name, g.msgs, flyerText);
      allFlyers = allFlyers.concat(r.flyers);
      const real = g.msgs.filter(m => !m.system);
      gmeta.push({name: g.name, stats: r.stats, first: real.length ? real[0].dt.slice(0, 10) : null, last: real.length ? real[real.length - 1].dt.slice(0, 10) : null});
      allItems = allItems.concat(r.items); allInfo = allInfo.concat(r.info);
    }
    const alias = identities(allInfo);
    for (const it of allItems) it.broker = alias[it.author];
    const seenF = new Set(), flyers = [];
    for (const f of allFlyers.sort((a, b) => a.dt < b.dt ? 1 : -1)){
      const k = f.images[0]; if (seenF.has(k)) continue; seenF.add(k);
      flyers.push({key: hash('f|' + k), images: f.images, broker: alias[f.author] || ('n' + hash(low(f.author)).slice(0, 8)), date: f.date, last_dt: f.dt, group: f.group});
    }
    const keyOff = x => x.listing_id ? 'id:' + x.listing_id : 'o|' + [x.op, x.type, (x.building || x.zones[0] || x.title.slice(0, 30)).toLowerCase(), x.beds_min, Math.round(x.m2 || 0), x.broker].join('|');
    const keyDem = x => 'd|' + [x.op, x.type, [...x.zones].sort().join(','), x.beds_min, x.price, x.broker].join('|');
    const agg = (rows, kf) => {
      const g = new Map(); for (const x of rows){ const k = kf(x); if (!g.has(k)) g.set(k, []); g.get(k).push(x); }
      const out = [];
      for (const [k, rs] of g){
        rs.sort((a, b) => a.dt < b.dt ? -1 : a.dt > b.dt ? 1 : 0);
        const last = {...rs[rs.length - 1]};
        last.first_seen = rs[0].date; last.last_seen = rs[rs.length - 1].date; last.times = rs.length; last.last_dt = rs[rs.length - 1].dt;
        last.post_dates = [...new Set(rs.map(r => r.date))];
        last.images = [...new Set(rs.slice().reverse().flatMap(r => r.images || []))].slice(0, 8);
        last.groups = [...new Set(rs.map(r => r.group))].sort();
        const hist = []; for (const r of rs) if (r.price && (!hist.length || hist[hist.length - 1][1] !== r.price)) hist.push([r.date, r.price]);
        last.price_history = hist;
        { // rebaja real: bajó entre 2% y 35% y el precio no va y viene (eso suele ser dos unidades distintas mezcladas)
          const v = hist.map(h => h[1]); let turns = 0; for (let i = 2; i < v.length; i++) if (Math.sign(v[i] - v[i - 1]) !== Math.sign(v[i - 1] - v[i - 2]) && v[i] !== v[i - 1]) turns++;
          const f = v[0], l = v[v.length - 1], pct = f ? (f - l) / f : 0;
          last.price_drop = v.length >= 2 && pct >= 0.02 && pct <= 0.35 && turns === 0;
          last.prev_price = last.price_drop ? f : null; last.drop_pct = last.price_drop ? Math.round(pct * 100) : 0;
        }
        last.key = hash(k); last.text = last.text.slice(0, 1500); delete last.dt; delete last.date; delete last.author;
        out.push(last);
      }
      return out;
    };
    const offers = agg(allItems.filter(x => x.kind === 'Oferta'), keyOff);
    const demands = mergeRepeats(agg(allItems.filter(x => x.kind === 'Demanda'), keyDem));
    const TODAY = [...offers, ...demands].reduce((a, x) => x.last_seen > a ? x.last_seen : a, '') || new Date().toISOString().slice(0, 10);
    const mine = ownItems(own, TODAY);

    // cierres anunciados
    for (const x of offers) x.closed = null; for (const x of demands) x.closed = null;
    const byB = new Map(); for (const x of [...offers, ...demands]){ if (!byB.has(x.broker)) byB.set(x.broker, []); byB.get(x.broker).push(x); }
    for (const mi of allInfo){
      const raw = mi.text.split(MEDIA).join('').trim(); if (!raw) continue;
      const first = low(cleanLine(raw.split('\n')[0]));
      const isO = CLOSE_OFF.test(first), isD = CLOSE_DEM.test(first); if (!isO && !isD) continue;
      const d = mi.dt.slice(0, 10), bid = alias[mi.author];
      const cands = (byB.get(bid) || []).filter(x => x.kind === (isO ? 'Oferta' : 'Demanda') && x.first_seen <= d && !x.closed);
      const bld = buildingOf(mi.text), zs = zonesOf(mi.text);
      let pick = cands.filter(x => bld && x.building === bld);
      if (!pick.length) pick = cands.filter(x => zs.length && x.zones.some(z => zs.includes(z)) && x.last_seen >= addDays(d, -60));
      if (!pick.length){ const r = cands.filter(x => x.last_seen >= addDays(d, -3)); pick = r.length === 1 ? r : []; }
      for (const x of pick) if (x.last_seen <= d) x.closed = {on: d, by: 'auto', text: mi.text.slice(0, 200)};
    }
    // vigencia
    const DV = {Alquiler: 30, Venta: 90}, OV = {Alquiler: 45, Venta: 150, 'Venta/Alquiler': 90};
    for (const q of demands){ q.valid_until = addDays(q.last_seen, DV[q.op] ?? 45); q.active = q.valid_until >= TODAY && !q.closed; }
    for (const o of offers){ o.valid_until = addDays(o.last_seen, OV[o.op] ?? 60); o.active = o.valid_until >= TODAY && !o.closed; }
    // coincidencias
    offers.push(...mine.offers); demands.push(...mine.demands);
    const byOp = {}; for (const o of offers) (byOp[o.op] ||= []).push(o);
    const pool = {Alquiler: [...(byOp.Alquiler || []), ...(byOp['Venta/Alquiler'] || [])], Venta: [...(byOp.Venta || []), ...(byOp['Venta/Alquiler'] || [])]};
    const matches = [];
    for (const q of demands){
      if (!q.op || !q.price) continue;
      const budget = q.price, cands = [];
      for (const o of (pool[q.op] || [])){
        const r = matchScore(q, o); if (r && r.score >= 60) cands.push({dem: q.key, off: o.key, ...r});
      }
      cands.sort((a, b) => b.score - a.score);
      matches.push(...cands.slice(0, 6));
    }
    // brokers
    const PAIRS = new Map();   // teléfono -> Map(nombre -> peso)
    for (const mi of allInfo) for (const [ph, n, w] of mi.sig.pairs || []){ if (!PAIRS.has(ph)) PAIRS.set(ph, new Map()); const m = PAIRS.get(ph); m.set(n, (m.get(n) || 0) + w); }
    for (const [ph, n] of Object.entries(own.contacts || {})){ const k = ph.replace(/\D/g, '').slice(-8); if (!PAIRS.has(k)) PAIRS.set(k, new Map()); PAIRS.get(k).set(n, 99); }
    const sigs = new Map(); for (const mi of allInfo){ const b = alias[mi.author]; if (!sigs.has(b)) sigs.set(b, []); sigs.get(b).push(mi); }
    const offBy = new Map(), demBy = new Map();
    for (const o of offers){ if (!offBy.has(o.broker)) offBy.set(o.broker, []); offBy.get(o.broker).push(o); }
    for (const q of demands){ if (!demBy.has(q.broker)) demBy.set(q.broker, []); demBy.get(q.broker).push(q); }
    const brokers = [];
    for (const [bid, ms] of sigs){
      const authors = counter(ms.map(mi => mi.author)), saved = [...authors.keys()].filter(a => !isPhone(a));
      const top = (arr) => { const c = mostCommon(counter(arr.filter(Boolean))); return c.length && c[0][1] >= Math.max(2, 0.03 * ms.length) ? c[0][0] : null; };
      // nombre de firma: cuenta 5 si firma junto a su propio teléfono, 1 si no
      const nw = new Map(); for (const mi of ms){ const n = mi.sig.name; if (n) nw.set(n, (nw.get(n) || 0) + (bid[0] === 'p' && mi.sig.namePhone === bid.slice(1) ? 5 : 1)); if (mi.sig.intro) nw.set(mi.sig.intro, (nw.get(mi.sig.intro) || 0) + 4); }
      if (bid[0] === 'p' && PAIRS.has(bid.slice(1))) for (const [n, w] of PAIRS.get(bid.slice(1))) nw.set(n, (nw.get(n) || 0) + w);
      const nTop = mostCommon(nw)[0];
      let sigName = nTop && nTop[1] >= Math.min(3, Math.max(2, 0.03 * ms.length)) ? nTop[0] : null;
      let comp = top(ms.map(mi => mi.sig.company));
      { const sp = comp && /^(.+?)\s+[–\-|]\s+(.+)$/.exec(comp); if (sp && okName(sp[1])){ if (!sigName) sigName = sp[1]; comp = sp[2]; } }
      const lic = mostCommon(counter(ms.map(mi => mi.sig.license).filter(Boolean)))[0]?.[0] || null;
      const ig = mostCommon(counter(ms.map(mi => mi.sig.instagram).filter(Boolean)))[0]?.[0] || null;
      const phone = bid[0] === 'p' ? `+507 ${bid.slice(1, 5)}-${bid.slice(5)}` : null;
      const display = saved[0] || sigName || phone;
      const mo = offBy.get(bid) || [], md = demBy.get(bid) || [];
      const zo = counter(mo.flatMap(o => o.zones)), zd = counter(md.flatMap(q => q.zones)), za = new Map();
      for (const [z, c] of zo) za.set(z, (za.get(z) || 0) + c); for (const [z, c] of zd) za.set(z, (za.get(z) || 0) + c);
      const no = mo.length, nd = md.length;
      const role = no + nd < 3 ? 'poco' : no >= 3 * Math.max(nd, 1) && no > nd ? 'ofrece' : nd >= 3 * Math.max(no, 1) && nd > no ? 'busca' : 'mixto';
      const months = counter(ms.map(mi => mi.dt.slice(0, 7)));
      const tk = toolsOf(ms.map(mi => mi.text));
      const dts = ms.map(mi => mi.dt).sort();
      brokers.push({id: bid, name: display, sig_name: sigName !== display ? sigName : null, phone, named: display !== phone, company: comp,
        license: lic, instagram: ig, aliases: [...authors.keys()].filter(a => a !== display), groups: [...new Set(ms.map(mi => mi.group))].sort(),
        msgs: ms.length, first: dts[0].slice(0, 10), last: dts[dts.length - 1].slice(0, 10), n_off: no, n_dem: nd, role, role_label: ROLE_LABEL[role],
        zones: mostCommon(za).slice(0, 8).map(([z]) => [z, zo.get(z) || 0, zd.get(z) || 0]),
        med_rent: median(mo.filter(o => o.op === 'Alquiler').map(o => o.price)), med_sale: median(mo.filter(o => o.op === 'Venta').map(o => o.price)),
        med_budget_rent: median(md.filter(q => q.op === 'Alquiler').map(q => q.price)), med_budget_sale: median(md.filter(q => q.op === 'Venta').map(q => q.price)),
        activity: [...months.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1), tools: tk.tools, sites: tk.sites,
        phones_seen: mostCommon(counter(ms.flatMap(mi => mi.sig.phones.slice(0, 2)))).filter(([, n]) => n >= 2).slice(0, 3).map(([p]) => p)});
    }
    if (mine.offers.length || mine.demands.length) brokers.push({id: 'yo', name: own.me || 'Yo', sig_name: null, phone: null, named: true, company: null, license: own.license || null, instagram: null, aliases: [], groups: ['Mis datos'],
      msgs: 0, first: TODAY, last: TODAY, n_off: mine.offers.length, n_dem: mine.demands.length, role: 'mixto', role_label: 'Tú', zones: [], med_rent: null, med_sale: null, med_budget_rent: null, med_budget_sale: null, activity: [], me: true});
    brokers.sort((a, b) => (b.n_off + b.n_dem) - (a.n_off + a.n_dem));
    // zonas (90 días)
    const since = addDays(TODAY, -90), Z = new Map();
    const zget = z => { if (!Z.has(z)) Z.set(z, {off_rent: 0, off_sale: 0, dem_rent: 0, dem_sale: 0, rp: [], sp: [], br: [], bk: new Map()}); return Z.get(z); };
    for (const o of offers){ if (o.last_seen < since) continue; for (const z of o.zones){ const r = zget(z); r.bk.set(o.broker, (r.bk.get(o.broker) || 0) + 1);
      if (o.op === 'Alquiler'){ r.off_rent++; if (o.price) r.rp.push(o.price); } else if (o.op === 'Venta' || o.op === 'Venta/Alquiler'){ r.off_sale++; if (o.price) r.sp.push(o.price); } } }
    for (const q of demands){ if (q.last_seen < since) continue; for (const z of q.zones){ const r = zget(z); r.bk.set(q.broker, (r.bk.get(q.broker) || 0) + 1);
      if (q.op === 'Alquiler'){ r.dem_rent++; if (q.price) r.br.push(q.price); } else if (q.op === 'Venta') r.dem_sale++; } }
    const zones = [...Z.entries()].map(([z, r]) => ({zone: z, off_rent: r.off_rent, off_sale: r.off_sale, dem_rent: r.dem_rent, dem_sale: r.dem_sale,
      med_rent: median(r.rp), med_sale: median(r.sp), med_budget_rent: median(r.br), top_brokers: mostCommon(r.bk).slice(0, 5).map(([b]) => b)}))
      .sort((a, b) => (b.off_rent + b.off_sale + b.dem_rent + b.dem_sale) - (a.off_rent + a.off_sale + a.dem_rent + a.dem_sale));
    return {bz: BZ, generated: new Date().toISOString().slice(0, 16), today: TODAY, groups: gmeta, offers, demands, matches, brokers, zones, flyers};
  }

  // combinar varias exportaciones del mismo grupo sin duplicar mensajes
  function mergeMsgs(lists){
    const out = [];
    const byK = new Map();
    for (const l of lists) for (const m of l){ const k = m.dt + '|' + (m.author || '') + '|' + m.text.length + '|' + m.text.slice(0, 80);
      const prev = byK.get(k); if (prev){ for (const n of m.images || []) if (!(prev.images ||= []).includes(n)) prev.images.push(n); continue; }
      const c = {...m, images: [...(m.images || [])]}; byK.set(k, c); out.push(c); }
    out.sort((a, b) => a.dt < b.dt ? -1 : a.dt > b.dt ? 1 : 0);
    return out;
  }
  const setBZ = m => { if (m) BZ = m; };
  if (!Object.keys(BZ).length) BZ = {...BLDG_ZONE};
  /* quién firma un texto pegado: nombre y teléfono */
  function whoSigned(text){ const sg = signature(text), pairs = sg.pairs || []; const ph = sg.namePhone ? sg.namePhone : (pairs[0] && pairs[0][0]) || (sg.phones[0] || '').replace(/\D/g, '').slice(-8);
    const name = sg.name || sg.intro || (pairs[0] && pairs[0][1]) || null; return {phone: ph ? '+507 ' + ph.slice(0, 4) + '-' + ph.slice(4) : null, name, company: sg.company, license: sg.license}; }
  return {whoSigned, setBZ, segments, parseChat, groupFromFile, groupKey, build, mergeMsgs, hash, matchScore, parseListing, parseListings, zoneList: [...new Set(ZONES.map(z => z[0]))].sort((a, b) => a.localeCompare(b, 'es'))};
})();
export default Engine;

