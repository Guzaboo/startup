(function () {
    'use strict'
  
    let forms = document.querySelectorAll('.needs-validation')
    let nameBox = document.querySelector('#bracketName')
    let participantsBox = document.querySelector('#participantsList')
    let doubleElimCheck = document.querySelector('#doubleElim')
    let participantsInvalidMessage = document.querySelector('#participantsList ~ .invalid-tooltip')

  
    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            console.log(nameBox.textContent.toString())
            if(nameBox.value === '') {
                nameBox.classList.add('is-invalid')
                event.preventDefault()
                event.stopPropagation()
            } else {
                nameBox.classList.remove('is-invalid')
            }

            if(!hasEnoughTeams(participantsBox.value, doubleElimCheck.checked)) {
                if(doubleElimCheck.checked) participantsInvalidMessage.textContent = 'Double elimination brackets require at least three teams.'
                else participantsInvalidMessage.textContent = 'Single elimination brackets require at least two teams.'
                participantsBox.classList.add('is-invalid')
                event.preventDefault()
                event.stopPropagation()
            } else {
                participantsBox.classList.remove('is-invalid')
            }
        }, false)
    })
})()

function hasEnoughTeams(p, double = false) {
    if(double) return /.+\n+.+\n+.+/im.test(p)
    return /.+\n+.+/im.test(p)
}