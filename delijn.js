let gc_is_open = false;
let gc_initialized = false;

async function fetchData(entiteit, halte) {
  const apiKey = 'ddb68605719d4bb8b6444b6871cefc7a';
  const apiUrl = `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${entiteit}/${halte}/real-time?maxAantalDoorkomsten=5`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    const data = await response.json();
    createApplication(data);
  } catch (error) {
    handleFetchError();
  }
}

async function fetchLijnData(entiteitnummer, lijnnummer) {
  const fetch_url = `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${entiteitnummer}/${lijnnummer}`;
  try {
    const response = await fetch(fetch_url, {
      headers: {
        'Ocp-Apim-Subscription-Key': 'ddb68605719d4bb8b6444b6871cefc7a',
      },
    });
    if (!response.ok) throw new Error('Lijn data could not be retrieved.');
    return await response.json();
  } catch (error) {
    console.error("Error fetching lijn data:", error);
    return null;
  }
}

async function createApplication(data) {
  const leftContainerbottom = document.getElementById('leftContainerbottom');
  if (!leftContainerbottom) return;

  if (!data.halteDoorkomsten[0]) {
    leftContainerbottom.innerHTML = '<p class=lijninfo>There are no buses for this stop at the moment.</p>';
    return;
  }

  clearLeftbottom();
  const { doorkomsten } = data.halteDoorkomsten[0];

  for (const doorkomst of doorkomsten) {
    const { entiteitnummer, bestemming, lijnnummer, dienstregelingTijdstip } = doorkomst;
    const perLijnData = await fetchLijnData(entiteitnummer, lijnnummer);
    const lijnnummerPubliek = perLijnData ? perLijnData.lijnnummerPubliek : lijnnummer;

    const dienstregelingDate = new Date(dienstregelingTijdstip);
    const currentDate = new Date();
    const dienstregelingMinutes = dienstregelingDate.getHours() * 60 + dienstregelingDate.getMinutes();
    const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
    let timeTillDeparture = dienstregelingMinutes - currentMinutes;

    let timeDifference = 'No data';
    const realTimeTijdstip = doorkomst["real-timeTijdstip"];
    if (realTimeTijdstip !== undefined) {
      const realTimeDate = new Date(realTimeTijdstip);
      const realTimeMinutes = realTimeDate.getHours() * 60 + realTimeDate.getMinutes();
      timeDifference = realTimeMinutes - dienstregelingMinutes;
      timeTillDeparture = realTimeMinutes - currentMinutes;
      timeDifference = timeDifference === 0 ? 'On time' : `+${timeDifference}`;
    }
    
    if (timeTillDeparture < -1000) {
      timeTillDeparture += 1440;
    }

    const minute = dienstregelingDate.getMinutes().toString().padStart(2, '0');
    const cardHTML = `
      <div class=lijncards>
        <div class="top">
          <h2 class=lijncardstitle>${lijnnummerPubliek}</h2>
          <div class="topright">
            <h3 class=lijncardsdestin>${bestemming}</h3>
            <p class="timedifference">${timeDifference}</p>
          </div>
        </div>
        <div class="times">
          <span class="time">${dienstregelingDate.getHours()}:${minute}</span>
          <span class="intime">${timeTillDeparture} Min.</span>
        </div>
      </div>`;

    leftContainerbottom.insertAdjacentHTML('beforeend', cardHTML);
  }

  const randomLink = Math.random() < 0.1
    ? `<a href="https://www.coolblue.be/nl/koffiezetapparaten/koffiezetapparaten-voor-latte-macchiato" target="_blank">Latte?</a>`
    : `<a href="https://www.delijn.be/nl/contact/attest-aanvraag/" target="_blank">Late?</a>`;
  leftContainerbottom.insertAdjacentHTML('beforeend', `<div class=lastdiv>${randomLink}</div>`);
}

function handleFetchError() {
  const leftContainerbottom = document.getElementById('leftContainerbottom');
  if (leftContainerbottom && !leftContainerbottom.innerHTML.includes('There are no buses')) {
    leftContainerbottom.innerHTML = '<p class=lijninfo>Could not fetch data, please try again later...</p>';
  }
}
