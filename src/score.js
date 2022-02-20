let number = document.getElementById("number");
let counter = 0;
setInterval(()=> {
    //score count stops at 65, change if needed
    if(counter == 65) {
        clearInterval();
    } else {
  counter += 1;
  number.innerHTML = counter;
    }

}, 30)//time in milli