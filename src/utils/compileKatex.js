export default function (node, preprocess, postprocess) {
  let katex;
  if (global.window) {
    katex = global.window.katex
  } else {
    return;
  }

  let defaultPreproc = (text) => text.replace(/\\{2}/mg, '<br>')
                                  .replace(/\n{2,}/mg, '<br>')
                                  // .replace(/\\textbf\{(.*?)\}/gm, ' \$\\bold\{\\text\{$1\}\}$ ')
                                  // .replace(/\\textit\{(.*?)\}/gm, ' \$\\mathit\{\\text\{$1\}\}$ ')
                                  // .replace(/\\textfrak\{(.*?)\}/gm, ' \$\\frak\{\\text\{$1\}\}$ ')
                                  // .replace(/\\textrm\{(.*?)\}/gm, ' \$\\mathrm\{\\text\{$1\}\}$ ')
                                  // .replace(/\\textsf\{(.*?)\}/gm, ' \$\\mathsf\{\\text\{$1\}\}$ ')
                                  // .replace(/\\texttt\{(.*?)\}/gm, ' \$\\mathtt\{\\text\{$1\}\}$ ')

  let defaultPostproc = (text) => text.replace(new RegExp('<span class="mrel">&lt;</span><span class="mord mathit">b</span><span class="mord mathit" style="margin-right:0.02778em;">r</span><span class="mrel">&gt;</span>', 'gm'), '<br>')
                                      .replace(new RegExp('<mo>&lt;</mo><mi>b</mi><mi>r</mi><mo>&gt;</mo>', 'gm'), '')

  let compileFormula = (formula, katexProps) => {
    let formulaPreproc = formula.replace(/&lt;/g, '\\lt')
                                .replace(/&gt;/g, '\\gt')
    let rendered
    let error

    try {
      rendered = katex.renderToString(formulaPreproc, katexProps)
    } catch (err) {
      // console.error(err)
      error = err
    }

    return {rendered, error}
  }

  Array.prototype.slice.call(node.querySelectorAll('.katexable'))
    .forEach(el => {
      el.innerHTML = typeof preprocess === 'function' ?
      defaultPreproc(preprocess(el.innerHTML)) : defaultPreproc(el.innerHTML)
      let dmathblocks = el.innerHTML.split('$$')
      let contentArr = []

      for (let index = 0; index < dmathblocks.length; index++) {
        if (index % 2) {
          let {rendered} = compileFormula(dmathblocks[index],
            {displayMode: true, throwOnError: false})
          if (typeof postprocess === 'function') {
            rendered = postprocess(defaultPostproc(rendered))
          }
          contentArr.push(defaultPostproc(rendered))
        } else {
          let mathblocks = dmathblocks[index].split('$')
          for (let innerIndex = 0; innerIndex < mathblocks.length; innerIndex++) {
            if (innerIndex % 2) {
              let {rendered} = compileFormula(mathblocks[innerIndex],
                {displayMode: false, throwOnError: false})
              if (typeof postprocess === 'function') {
                rendered = postprocess(defaultPostproc(rendered))
              }
              contentArr.push(defaultPostproc(rendered))
            } else {
              let rendered = mathblocks[innerIndex]
              // if (typeof postrocess === 'function') {
              //   rendered = postprocess(rendered)
              // }
              contentArr.push(rendered)
            }
          }
        }
      }

      el.innerHTML = contentArr.join('')
    })
}
