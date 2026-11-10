document.querySelectorAll('.js-repeater-button').forEach(function (button) {
  button.addEventListener('click', function () {
    function incrementFirstNumber(value) {
      return value.replace(/\d+/, function (match) {
        return String(parseInt(match, 10) + 1)
      })
    }

    const sections = document.querySelectorAll('div[id^="js-repeater-section-"]')
    const lastSection = sections[sections.length - 1]

    const newSection = lastSection.cloneNode(true)
    newSection.id = incrementFirstNumber(lastSection.id)

    newSection.querySelectorAll('label').forEach(function (label) {
      label.htmlFor = incrementFirstNumber(label.htmlFor)
    })

    newSection.querySelectorAll('input').forEach(function (input) {
      input.value = ''
      input.name = incrementFirstNumber(input.name)
      input.id = incrementFirstNumber(input.id)
    })

    lastSection.after(newSection)
  })
})
