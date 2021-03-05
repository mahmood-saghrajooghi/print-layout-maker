class Page {
  constructor(props) {
    this.layout = props.layout;
    this.screenDPI = 96;
    this.rowSpanTD = props.rowSpanTD;
    this.calcHeight()
    this.preparePage()
    this.prepareBodyRows()
    this.render();
  }
  preparePage() {
    // A4 page size in centimeter is 21 cm x 29.7 cm
    let pageWidth, pageHeight;
    if (this.layout == 'portrait') {
      pageWidth = 21;
      pageHeight = 29.7;
    } else if (this.layout == 'landscape') {
      pageWidth = 29.7;
      pageHeight = 21;
    }
    this.setPageDimensions({ pageWidth, pageHeight })
  }

  /**
   * Sets Page Dimensions.
   * @constructor
   * @param {Number} pageWidth - Page width in centimeters
   * @param {Number} PageHeight - Page height in centimeters
   */
  setPageDimensions(dimensions) {
    const { pageWidth, pageHeight } = dimensions;
    this.pageHeightInCm = pageHeight
    this.pageHeightInPx = this.cmToPixel(pageHeight);
    this.pageWidthInCm = pageWidth;
    this.pageWidthInPx = this.cmToPixel(pageWidth)
  }

  calcHeight() {
    this.header = document.querySelector('[data-role="header"]');
    this.headerHeight = this.header.offsetHeight;
    this.footer = document.querySelector('[data-role="footer"]')
    this.footerHeight = this.footer.offsetHeight;
    this.body = document.querySelector('[data-role="body"]')
    this.bodyHeight = this.body.offsetHeight;
    this.documentHeight = this.headerHeight + this.bodyHeight + this.footerHeight
  }

  prepareBodyRows() {
    this.rows = [''];
    let rowIndex = 0;
    let bodyHeightLimit = this.pageHeightInPx - this.headerHeight - this.footerHeight;
    let totalHeight = 0;
    let index = 0;
    for (let node of this.body.children) {
      totalHeight += node.offsetHeight;
      if (this.rowSpanTD) {
        this.checkForRowSpan(node);
        this.updateRowSpanStatus();
      }
      if (totalHeight > bodyHeightLimit) {
        index = 0;
        totalHeight = node.offsetHeight;
        rowIndex++;
        this.rows[rowIndex] = '';
        node = this.appendRowSpanNodes(node);
      }
      if (index === 0) {
        node = this.checkFirstRowStyles(node);
      }
      this.rows[rowIndex] += node.outerHTML
      index++;
    }

  }
  checkForRowSpan(node) {
    let index = 0;
    for (let subNode of node.children) {
      index++;
      if (subNode.attributes.rowSpan) {
        if (this.rowSpanNodes) {
          this.rowSpanNodes.push({
            element: subNode,
            index: index,
            length: subNode.getAttribute('rowspan')
          })
        } else {
          this.rowSpanNodes = [{
            element: subNode,
            index: index,
            length: subNode.attributes.rowspan.value
          }]
        }
      }
    }
  }
  updateRowSpanStatus() {
    if (this.rowSpanNodes) {
      this.rowSpanNodes = this.rowSpanNodes.map(node => {
        if (node.length == 1) {
          return {}
        }
        node.element.setAttribute('rowspan', node.length - 1);
        return { ...node, length: node.length - 1 }
      })
    }
  }
  appendRowSpanNodes(node) {
    this.rowSpanNodes.forEach(subNode => {
      node.insertBefore(subNode.element, node.children[subNode.index]);
    })
    return node;
  }
  checkFirstRowStyles(node) {
    let index = 0;
    if (!this.firstRowChildStyles) {
      this.firstRowChildStyles = []
      for (let childNode of node.children) {
        this.firstRowChildStyles[index] = childNode.style.width;
        index++;
      }
    } else {
      for (let childNode of node.children) {
        childNode.style.width = this.firstRowChildStyles[index];
        index++;
      }
    }
    return node;
  }

  render() {
    document.body.innerHTML = ''
    this.rows.forEach(rowLayout => {
      // console.log(rowLayout);
      const a = `<table class="table-1 bordered" style="width: 100%;direction: rtl;"><tbody style="direction:rtl;">`
      const c = `</tbody></table>`
      const d = `<div class="container-offical" style="font-size:13px"><div class="box">`
      const e = `</div></div>`
      const pageLayout = d + this.header.innerHTML + a + rowLayout + c + this.footer.innerHTML + e;
      const b = new DOMParser().parseFromString(pageLayout, 'text/html').body
      b.style.width = this.pageWidthInPx
      b.style.height = this.pageHeightInPx
      // console.log(b);
      document.body.appendChild(b)
    })
  }

  cmToPixel(cm) {
    return cm * this.screenDPI / 2.54;
  }
  print() {
    window.print();
  }
}


document.querySelector('[data-role="print"]').addEventListener('click', function () {
  const page = new Page({
    layout: 'landscape',
    rowSpanTD: true
  });
  // page.print();
})