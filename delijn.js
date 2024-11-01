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
    console.error("Fetch error:", error);
    handleFetchError();
  }
}

async function fetchLijnData(entiteitnummer, lijnnummer) {
  const fetch_url = `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${entiteitnummer}/${lijnnummer}`;
  return await fetchApiData(fetch_url);
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
    let { entiteitnummer, bestemming, lijnnummer, dienstregelingTijdstip } = doorkomst;
    let perLijnData = await fetchLijnData(entiteitnummer, lijnnummer);
    lijnnummer = perLijnData.lijnnummerPubliek;

    const real_timeTijdstip = doorkomst["real-timeTijdstip"];
    const date = new Date(dienstregelingTijdstip);
    const currentdate = new Date();
    
    let hour = date.getHours();
    let minute = date.getMinutes().toString().padStart(2, '0');
    const totalMinutes = hour * 60 + Number(minute);
    const totalMinutescurrent = currentdate.getHours() * 60 + currentdate.getMinutes();
    
    let timeDifference = 'No data';
    let timetilldep = totalMinutes - totalMinutescurrent;

    // Check and calculate real-time data if available
    if (real_timeTijdstip !== undefined) {
      console.log("Real-time timestamp is defined:", real_timeTijdstip);
      const realtimedate = new Date(real_timeTijdstip);
      const hourrealtime = realtimedate.getHours();
      let minuterealtime = realtimedate.getMinutes().toString().padStart(2, '0');
      const totalMinutesrealtime = hourrealtime * 60 + Number(minuterealtime);
      
      timeDifference = totalMinutesrealtime - totalMinutes;
      timetilldep = totalMinutesrealtime - totalMinutescurrent;

      if (timeDifference === 0) {
        timeDifference = 'On time';
      } else if (timeDifference > 0) {
        timeDifference = `+${timeDifference}`;
      }
    }

    // Adjust for negative values that cross midnight
    if (timetilldep < -1000) {
      timetilldep += 1440;  // Adds 24 hours to correct for next-day times
    }

    const div = document.createElement('div');
    div.innerHTML = `
      <div class="lijncards">
        <div class="top">
          <h2 class="lijncardstitle">${lijnnummer}</h2>
          <div class="topright">
            <h3 class="lijncardsdestin">${bestemming}</h3>
            <p class="timedifference">${timeDifference}</p>
          </div>
        </div>
        <div class="times">
          <span class="time">${hour}:${minute}</span>
          <span class="intime">${timetilldep} Min.</span>
        </div>
      </div>
    `;
    leftContainerbottom.appendChild(div);
  }

  const lastdiv = document.createElement('div');
  if (Math.random() < 0.1) {
    lastdiv.innerHTML = `<div class="lastdiv"><a href="https://www.coolblue.be/nl/koffiezetapparaten/koffiezetapparaten-voor-latte-macchiato?utm_source=bing&utm_medium=cpc&utm_content=search&cmt=c_b,cp_554669870,aid_1297424829986242,t_kwd-81089287897708:loc-14,n_o,d_c,lp_611&msclkid=1f7482f3ed5c1b56a37de72c7f194ba4" target="_blank">Latte?</a></div>`;
  } else {
    lastdiv.innerHTML = `<div class="lastdiv"><a href="https://www.delijn.be/nl/contact/attest-aanvraag/" target="_blank">Late?</a></div>`;
  }
  leftContainerbottom.appendChild(lastdiv);
}

function handleFetchError() {
  const leftContainerbottom = document.getElementById('leftContainerbottom');
  if (!leftContainerbottom || leftContainerbottom.innerText === 'There are no buses for this stop at the moment.') {
    leftContainerbottom.innerHTML = '<p class="lijninfo">Could not fetch data, please try again later...</p>';
  }
}
