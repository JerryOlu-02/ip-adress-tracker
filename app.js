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
  constructor(value) {
    this.value = value;
    window.addEventListener('load', this._getApi.bind(this));
    btn.addEventListener('click', this._getApi.bind(this));
    ipText.addEventListener('keydown', this._runApi.bind(this));

    // this._getApi();
  }

  _renderIP(ip, city, reg, post, zone, ispI) {
    ipAddress.textContent = ip;
    ipLocation.innerHTML = `${city}, ${reg} 
    ${post}`;
    timezone.textContent = zone;
    isp.textContent = ispI;
  }

  _getPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  _renderError(err) {
    errorMsg.textContent = err;
    errorMsg.classList.remove('inactive');
  }

  _runApi(e) {
    if (e.key !== 'Enter') return;

    this._getApi();
  }

  async _getApi() {
    try {
      const geoIpfy = await fetch(
        `https://geo.ipify.org/api/v2/country,city?apiKey=at_YBUZusorUE31nMICnPdMYH9CS9qVC&ipAddress=${ipText.value}`
      );
      if (!geoIpfy.ok) throw new Error('API call Limit Reached');
      const data = await geoIpfy.json();

      // Get needed Data out of API
      const { ip: newIp, isp: newIsp, location: newLocation } = await data;
      const {
        region: newRegion,
        timezone: newTimezone,
        postalCode: newPostalCode,
        lat: newLat,
        lng: newLng,
        city: newCity,
      } = await newLocation;

      this.#map = await L.map('map', {
        center: [newLat, newLng],
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

      await L.marker([newLat, newLng], { icon: this.#myIcon })
        .addTo(this.#map)
        .openPopup();

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
}

const app = new App('Space X');
