var AutoCompleteList = [];

/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Auto complate for input elements on key down
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
*/
class AutoComplete {

    constructor(txtBox, source) {
        this.currentFocus = -1;
        this.textBox = typeof txtBox == "string" ? document.getElementById(txtBox) : txtBox;
        this.source = source;
    }

    removeActive(x) {
        for (let i in x) {
            i.classList.remove("autocomplete-active");
        }
    }

    addActive(x) {
        if (!x) {
            return false;
        }
        removeActive(x);
        if (this.currentFocus >= x.length) {
            this.currentFocus = 0;
        }
        if (this.currentFocus < 0) {
            this.currentFocus = x.length - 1;
        }
        x[this.currentFocus].classList.add("autocomplete-active");
    }

    closeAllLists(e) {
        let x = document.getElementsByClassName("autocomplete-items");
        for (const element of x) {
            if (e != element && e != this.textBox) {
                element.remove();
            }
        }
    }

    init() {
        this.textBox.addEventListener("input", function (e) {
            AutoCompleteList[this.id].closeAllLists();
            if (!this.value) {
                return false;
            }
            AutoCompleteList[this.id].currentFocus = -1;
            let a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            this.parentNode.appendChild(a);
            for (let s in AutoCompleteList[this.id].source) {
                let p = s.trUpper().indexOf(this.value.trUpper());
                if (p > -1) {
                    let b = document.createElement("DIV");
                    b.setAttribute("id", this.id + "_button" + AutoCompleteList[this.id].source[s]);
                    b.innerHTML = s.substring(0, p);
                    b.innerHTML += "<strong>" + this.value + "</strong>";
                    b.innerHTML += s.substring(p + this.value.length);
                    b.innerHTML += "<input type='hidden' value='" + s + "'>";
                    b.addEventListener("click", function () {
                        let p1 = this.id.indexOf("_button");
                        let tBoxId = this.id.substring(0, p1);
                        AutoCompleteList[tBoxId].textBox.value = this.getElementsByTagName("input")[0].value;
                        AutoCompleteList[tBoxId].closeAllLists();
                        document.getElementById(tBoxId + "Id").value = AutoCompleteList[tBoxId].source[AutoCompleteList[tBoxId].textBox.value];
                    });
                    a.appendChild(b);
                }
            }
            if (a.childElementCount == 0) {
                let b = document.createElement("DIV");
                b.setAttribute("id", this.id + "_button");
                b.innerHTML = "Eşleşme bulunamadı...";
                b.addEventListener("click", function () {
                    let p1 = this.id.indexOf("_button");
                    let tBoxId = this.id.substring(0, p1);
                    AutoCompleteList[tBoxId].textBox.value = '';
                    AutoCompleteList[tBoxId].closeAllLists();
                    document.getElementById(AutoCompleteList[tBoxId].textBox.id + "Id").value = "0";
                });
                a.appendChild(b);
            }
        });

        this.textBox.addEventListener("keydown", function (e) {
            let x = document.getElementById(this.id + "autocomplete-list")?.getElementsByTagName("div");
            if (e.keyCode == 40) {
                AutoCompleteList[this.id].currentFocus++;
                AutoCompleteList[this.id].addActive(x);
            }
            else if (e.keyCode == 38) {
                AutoCompleteList[this.id].currentFocus--;
                AutoCompleteList[this.id].addActive(x);
            }
            else if (e.keyCode == 13) {
                e.preventDefault();
                if (AutoCompleteList[this.id].currentFocus > -1 && x) {
                    x[currentFocus].click();
                }
            }
        });

        document.addEventListener("click", function (e) {
            let x = document.getElementsByClassName("autocomplete-items");
            if (x.length > 0) {
                for (const element of x) {
                    if (e.target != element && e.target != this.textBox) {
                        element.remove();
                    }
                }
            }
        });

        AutoCompleteList[this.textBox.id] = this;
    }
}