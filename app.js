'use strict';
const map = document.querySelector('#map');
const btn = document.querySelector('.btn');
const ipText = document.querySelector('.text--input');
const ipAddress = document.querySelector('.ip--address');
const ipLocation = document.querySelector('.location');
const timezone = document.querySelector('.timezone > span');
const isp = document.querySelector('.isp');
const errorMsg = document.querySelector('.error--div');

class App {
  #map;
  #myIcon;
  #lat;
  #lng;
  constructor() {
    this._runApp();
    btn.addEventListener('click', this._runApp.bind(this));
    ipText.addEventListener('keydown', this._runApi.bind(this));
  }

  _renderIP(ip, city, reg, post, zone, ispI) {
    ipAddress.textContent = ip;
    ipLocation.innerHTML = `${city}, ${reg} 
    ${post}`;
    timezone.textContent = zone;
    isp.textContent = ispI;
  }

  _renderError(err) {
    errorMsg.textContent = err;
    errorMsg.classList.remove('inactive');
  }

  _runApi(e) {
    if (e.key !== 'Enter') return;
    this._runApp();
  }

  _renderMap() {
    if (this.#map != undefined) {
      this.#map.remove();
    }
    this.#map = L.map('map', {
      center: [this.#lat, this.#lng],
      zoom: 15,
      boxZoom: false,
      dragging: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#myIcon = L.icon({
      iconUrl: 'images/icon-location.svg',
      iconSize: [35, 60],
      iconAnchor: [22, 94],
      popupAnchor: [-3, -76],
    });

    L.marker([this.#lat, this.#lng], { icon: this.#myIcon })
      .addTo(this.#map)
      .openPopup();
  }

  async _getApi() {
    try {
      let data;
      const geoIpfy = await fetch(
        `https://geo.ipify.org/api/v2/country,city?apiKey=at_YBUZusorUE31nMICnPdMYH9CS9qVC&ipAddress=${ipText.value}`
      );
      if (!geoIpfy.ok) throw new Error('Could not Fetch');
      data = await geoIpfy.json();

      // Get needed Data out of API
      let { ip: newIp, isp: newIsp, location: newLocation } = await data;
      let {
        region: newRegion,
        timezone: newTimezone,
        postalCode: newPostalCode,
        lat: newLat,
        lng: newLng,
        city: newCity,
      } = await newLocation;
      this.#lat = newLat;
      this.#lng = newLng;

      // RENDER LOCATION
      this._renderIP(
        newIp,
        newCity,
        newRegion,
        newPostalCode,
        newTimezone,
        newIsp
      );
    } catch (error) {
      console.log(error);
      this._renderError(error.message);

      setTimeout(() => {
        errorMsg.classList.add('inactive');
      }, 5000);
    }
  }

  async _runApp() {
    try {
      await this._getApi();
      await this._renderMap();
    } catch (error) {
      console.error(error.message);
    }
  }
}

const app = new App();
