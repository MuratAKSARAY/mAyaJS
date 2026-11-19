/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Reorder HTML elements on page
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 * @sample   Sortable.MakeSortable("sortable-row")
 * @class    .dragging { opacity: 0.5; } .drag-over { outline: 2px dashed #007bff; }
 *
*/
class Sortable {
  static DragStart(e) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", e.target.id);
    e.target.classList.add("dragging");
  }

  static DragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const row = e.target.closest("tr");
    if (row && !row.classList.contains("dragging")) {
      row.classList.add("drag-over");
    }
  }

  static DragLeave(e) {
    const row = e.target.closest("tr");
    if (row) row.classList.remove("drag-over");
  }

  static Drop(e) {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    const draggedRow = document.getElementById(draggedId);
    const targetRow = e.target.closest("tr");

    if (draggedRow && targetRow && draggedRow !== targetRow) {
      targetRow.classList.remove("drag-over");
      const parent = targetRow.parentNode;
      const children = Array.from(parent.children);

      if (children.indexOf(targetRow) > children.indexOf(draggedRow)) {
        targetRow.after(draggedRow);
      } else {
        targetRow.before(draggedRow);
      }
    }
    draggedRow.classList.remove("dragging");
  }

  static MakeSortable(className) {
    const rows = document.getElementsByClassName(className);
    for (const row of rows) {
      row.setAttribute("draggable", "true");
      row.addEventListener("dragstart", this.DragStart);
      row.addEventListener("dragover", this.DragOver);
      row.addEventListener("dragleave", this.DragLeave);
      row.addEventListener("drop", this.Drop);
    }
  }
}
