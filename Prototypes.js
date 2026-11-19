/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Add usefull features to elements
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
Element.prototype.hide = function () {
    this.style.visibility = 'hidden';
    this.style.display = 'none';
};

Element.prototype.show = function () {
    this.style.visibility = 'visible';
    this.style.display = 'inline-block';
};

Element.prototype.toggle = function () {
    element = arguments.length > 0 ? document.getElementById(arguments[0]) : this;
    if (element.clientWidth > 0) {
        element.style.visibility = 'hidden';
        element.style.display = 'none';
    }
    else {
        element.style.visibility = 'visible';
        element.style.display = 'inline-block';
    }
};

Element.prototype.hasClass = function (cssClass) {
    return this.className.exec(new RegExp(String.raw`(\s|^)` + cssClass + String.raw`(\s|$)`));
};

Element.prototype.addClass = function (cssClass) {
    this.className += ' ' + cssClass;
};

Element.prototype.removeClass = function (cssClass) {
    if (this.hasClass(cssClass)) {
        let reg = new RegExp(String.raw`(\s|^)` + cssClass + String.raw`(\s|$)`);
        this.className = this.className.replace(reg, '');
    }
};

Element.prototype.getStyle = function (cssProperty) {
    if (this.currentStyle) {
        if (this.currentStyle) {
            return this.currentStyle[cssProperty];
        } else if (globalThis.getComputedStyle) {
            return document.defaultView.getComputedStyle(this, null).getPropertyValue(cssProperty);
        } else {
            return this.style[cssProperty[0].trim()];
        }
    };

    Element.prototype.addEvent = function (type, fn) {
        if (this.attachEvent) {
            this.attachEvent('on' + type, fn);
        } else if (this.addEventListener) {
            this.addEventListener(type, fn, false);
        } else if (this.setAttribute) {
            this.setAttribute('on' + type, fn);
        } else this['on' + type] = fn;
    };

    Element.prototype.removeEvent = function (type, fn) {
        if (this.detachEvent) {
            this.detachEvent('on' + type, fn);
        } else if (this.removeEventListener) {
            this.removeEventListener(type, fn, false);
        } else if (this.removeAttribute) {
            this.removeAttribute('on' + type, 0);
        } else this['on' + type] = function () { return false; };
    };

    Element.prototype.size = function () {
        let ret = {};
        ret.width = this.innerWidth || this.clientWidth || this.offsetWidth;
        ret.height = this.innerHeight || this.clientHeight || this.offsetHeight;
        return ret;
    };

    Element.prototype.pos = function () {
        let ret = {};
        ret.top = 0;
        ret.left = 0;
        if (this.offsetParent)
            while (1) {
                ret.top += this.offsetTop;
                ret.left += this.offsetLeft;
                if (!this.offsetParent) {
                    break;
                }
                this = this.offsetParent;
            }
        else {
            if (this.y) {
                ret.top += this.y;
            }
            if (this.x) {
                ret.left += this.x;
            }
        }
        return ret;
    };

    Element.prototype.setParentWidth = function (width) {
        this.parentNode.style.width = width;
    };

    Element.prototype.setParentHeight = function (height) {
        this.parentNode.style.height = height;
    };

    Element.prototype.doPostBack = function () {
        let element = document.forms[0];
        if (arguments.length > 0) {
            let input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'mAyaCommand';
            input.value = arguments[0];
            element.appendChild(input);
        }
        if (!element.onsubmit || (element.onsubmit())) {
            element.submit();
        }
    };

    Element.prototype.doClick = function () {
        switch (arguments.length) {
            case 1: {
                globalThis.location.href = arguments[0];
                return true;
            }
            case 2: {
                if (arguments[0] == '_blank') {
                    globalThis.open(arguments[1]);
                }
                else {
                    fetch(arguments[1]).then(response => document.getElementById(arguments[0]).innerHTML = response.body);
                }
                return true;
            }
            case 3: {
                let obj = document.getElementById(arguments[0]);
                if (arguments[2] != '') {
                    obj.style.width = arguments[2] + 'px';
                }
                fetch(arguments[1]).then(response => obj.innerHTML = response.body);
                return true;
            }
            case 4: {
                let obj = document.getElementById(arguments[0]);
                if (arguments[2] != '') {
                    obj.style.width = arguments[2] + 'px';
                }
                if (arguments[3] != '') {
                    obj.style.height = arguments[3] + 'px';
                }
                fetch(arguments[1]).then(response => obj.innerHTML = response.body);
                return true;
            }
            default: {
                return false;
            }
        }
    };

    globalThis.location.get = function (key, default_) {
        if (default_ == null) {
            default_ = "";
        }
        key = key.replace(/(\[)/, String.raw`\[`).replace(/(\])/, String.raw`\]`).replace(/(\$)/, String.raw`\$`);
        let regex = new RegExp(String.raw`[\?&]` + key + "=([^&#]*)");
        let qs = regex.exec(globalThis.location.href);
        return qs == null ? default_ : qs[1];
    };

    globalThis.securityCode = function (codeLength = 5) {
        let charSet = "ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < codeLength; i++) {
            let pos = Math.floor(Math.random() * charSet.length);
            result += charSet.charAt(pos);
        }
        return result;
    };

    globalThis.preventBack = function () {
        setTimeout(() => { globalThis.history.forward(); }, 0);
        globalThis.onbeforeunload = function () { return null; };
    };

    HTMLImageElement.prototype.preview = function (viewer) {
        element = typeof viewer == 'string' ? document.getElementById(viewer) : viewer;
        if (element == null) {
            return false;
        }
        element.style.visibility = 'hidden';
        element.src = this.src;
        element.style.visibility = 'visible';
    };

    HTMLTableElement.prototype.sort = function (rowIndex = 0, type = 'string', order = 'asc') {
        if (this.type.toLowerCase() != 'table' || this.tBodies.length == 0) {
            return false;
        }
        if (rowIndex < 0 || rowIndex >= this.tBodies[0].rows[0].cells.length) {
            rowIndex = 0;
        }
        let tbody = this.tBodies[0];
        let rows = Array.from(tbody.rows);
        let compare;
        switch (type) {
            case 'int':
                compare = function (rowA, rowB) {
                    return parseInt(rowA.cells[rowIndex].innerText) - parseInt(rowB.cells[rowIndex].innerText);
                };
                break;
            case 'float':
                compare = function (rowA, rowB) {
                    return parseFloat(rowA.cells[rowIndex].innerText) - parseFloat(rowB.cells[rowIndex].innerText);
                };
                break;
            case 'date':
                compare = function (rowA, rowB) {
                    return new Date(rowA.cells[rowIndex].innerText) - new Date(rowB.cells[rowIndex].innerText);
                };
                break;
            case 'string':
            default:
                compare = function (rowA, rowB) {
                    return rowA.cells[rowIndex].innerText.localeCompare(rowB.cells[rowIndex].innerText);
                };
                break;
        }
        rows.sort(compare);
        if (order == 'desc') {
            rows.reverse();
        }
        for (const row of rows) {
            tbody.appendChild(row);
        }
        return true;
    };
}