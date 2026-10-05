// Minimal host DOM for React DOM lifecycle tests. React itself performs all
// reconciliation, hook state and mount/unmount behavior; no fake hook renderer.
class Node {
  constructor(tag, doc, type = 1) {
    this.nodeType = type;
    this.tagName = tag.toUpperCase();
    this.nodeName = this.tagName;
    this.ownerDocument = doc;
    this.namespaceURI = 'http://www.w3.org/1999/xhtml';
    this.childNodes = [];
    this.parentNode = null;
    this.attributes = {};
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.data = '';
  }
  appendChild(child) {
    if (child.parentNode) child.parentNode.removeChild(child);
    this.childNodes.push(child); child.parentNode = this; return child;
  }
  insertBefore(child, before) {
    if (child.parentNode) child.parentNode.removeChild(child);
    this.childNodes.splice(this.childNodes.indexOf(before), 0, child);
    child.parentNode = this; return child;
  }
  removeChild(child) {
    this.childNodes.splice(this.childNodes.indexOf(child), 1);
    child.parentNode = null; return child;
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener() {}
  removeEventListener() {}
  get firstChild() { return this.childNodes[0] ?? null; }
  get lastChild() { return this.childNodes.at(-1) ?? null; }
  get nextSibling() { return this.parentNode?.childNodes[this.parentNode.childNodes.indexOf(this) + 1] ?? null; }
  get textContent() { return this.nodeType === 3 ? this.data : this.data + this.childNodes.map(node => node.textContent).join(''); }
  set textContent(text) { this.childNodes.forEach(child => { child.parentNode = null; }); this.childNodes = []; this.data = String(text); }
}
const previous = new Map();
function install() {
  const doc = new Node('#document', null, 9);
  const window = { HTMLElement: Node, HTMLIFrameElement: class {}, addEventListener() {}, removeEventListener() {}, document: doc };
  doc.ownerDocument = doc;
  doc.defaultView = window;
  doc.createElement = tag => new Node(tag, doc);
  doc.createElementNS = (_, tag) => new Node(tag, doc);
  doc.createTextNode = text => { const node = new Node('#text', doc, 3); node.data = text; return node; };
  doc.documentElement = doc.createElement('html');
  doc.body = doc.createElement('body');
  doc.activeElement = doc.body;
  for (const [key, value] of Object.entries({ window, document: doc, navigator: { userAgent: 'nodejs' }, IS_REACT_ACT_ENVIRONMENT: true })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  return doc.createElement('div');
}
function restore() {
  for (const [key, descriptor] of previous) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
  previous.clear();
}
module.exports = { install, restore };
