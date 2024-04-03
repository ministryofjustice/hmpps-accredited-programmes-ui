const backLink = document.querySelector('.js-back-link')

if (backLink) {
  if (window.history.length > 1) {
    backLink.addEventListener('click', function (event) {
      event.preventDefault()
      window.history.back()
    })
  }
}
