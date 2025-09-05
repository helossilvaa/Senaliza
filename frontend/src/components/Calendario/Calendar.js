export default function initCalendar(styles, onDateSelect, markedDate) {
  const monthYear = document.getElementById("month-year");
  const daysContainer = document.getElementById("days");
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  let currentDate = new Date();
  let today = new Date();

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = `${months[month]} ${year}`;

    daysContainer.innerHTML = "";

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDay; i > 0; i--) {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = prevMonthLastDay - i + 1;
      dayDiv.classList.add("fade");
      daysContainer.appendChild(dayDiv);
    }

    for (let i = 1; i <= lastDay; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = i;

      if (
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        dayDiv.classList.add(styles.today);
      }

     
      if (markedDate) {
  const prazo = new Date(markedDate);
  const inicio = new Date(); // hoje
  inicio.setHours(0,0,0,0);
  prazo.setHours(0,0,0,0);

  const diaAtual = new Date(year, month, i);

  
  if (diaAtual >= inicio && diaAtual <= prazo) {
    dayDiv.classList.add(styles.marked);
  }
}


      daysContainer.appendChild(dayDiv);

      dayDiv.addEventListener("click", () => {
        
        document.querySelectorAll(`.${styles.days} div`).forEach((day) => {
          day.classList.remove(styles.active);
        });

        
        dayDiv.classList.add(styles.active);

       
        const selectedDate = `${year}-${(month + 1)
          .toString()
          .padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
        onDateSelect(selectedDate);
      });
    }

    const nextMonthStartDay = 7 - new Date(year, month + 1, 0).getDay() - 1;
    for (let i = 1; i <= nextMonthStartDay; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = i;
      dayDiv.classList.add("fade");
      daysContainer.appendChild(dayDiv);
    }
  }

  prevButton.addEventListener("click", function () {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextButton.addEventListener("click", function () {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  renderCalendar(currentDate);
}