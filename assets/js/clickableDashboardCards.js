window.onload = function () {
  document.querySelectorAll('.dashboard__card').forEach(card => {
    card.classList.add('dashboard__card--linked')

    card.addEventListener('click', () => {
      card.querySelector('a').click()
    })
  })
}
