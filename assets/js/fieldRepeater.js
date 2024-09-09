$('.js-repeater-button').on('click', function () {
  const $lastDiv = $('div[id^="js-repeater-section-"]:last')

  const num = parseInt($lastDiv.prop('id').match(/\d+/g), 10) + 1

  const $clone = $lastDiv.clone().prop('id', `js-repeater-section-${num}`)

  $clone.find('label').each(function () {
    const inputLabel = parseInt(this.htmlFor.match(/\d+/), 10) + 1
    this.htmlFor = this.htmlFor.replace(/\d+/, inputLabel)
  })

  $clone.find('input').each(function () {
    this.value = ''
    const inputNumber = parseInt(this.name.match(/\d+/), 10) + 1
    this.name = this.name.replace(/\d+/, inputNumber)
    this.id = this.id.replace(/\d+/, inputNumber)
  })

  $lastDiv.after($clone)
})