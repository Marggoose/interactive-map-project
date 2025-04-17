const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2
  });
  
  const planWidth = 2000;
  const planHeight = 1200;
  const bounds = [[0, 0], [planHeight, planWidth]];
  
  L.imageOverlay('plan/building-plan.png', bounds).addTo(map);
  map.fitBounds(bounds);
  
  // Загрузка данных из map-data.json
  fetch('map-data.json')
    .then(response => response.json())
    .then(data => {
      // Добавление предустановленных меток
      data.rooms.forEach(room => {
        const marker = L.marker(room.coords).addTo(map);
        marker.bindPopup(`
          <strong>${room.name}</strong><br/>
          <img src="${room.image}" alt="${room.name}" width="200" /><br/>
          <em>${room.info}</em>
        `);
      });
  
      // Добавление маршрутов
      data.routes.forEach(route => {
        const fromRoom = data.rooms.find(r => r.name === route.from);
        const toRoom = data.rooms.find(r => r.name === route.to);
        if (fromRoom && toRoom) {
          L.polyline([fromRoom.coords, toRoom.coords], {
            color: 'blue',
            weight: 3,
            dashArray: '5, 5'
          }).addTo(map);
        }
      });
    });
  
    let pendingCoords = null;

    map.on('click', function (e) {
      pendingCoords = [e.latlng.lat, e.latlng.lng];
      openModal();
    });
    
    function openModal() {
      document.getElementById('markerModal').style.display = 'flex';
      document.getElementById('markerName').value = '';
      document.getElementById('markerDesc').value = '';
    }
    
    function closeModal() {
      document.getElementById('markerModal').style.display = 'none';
      pendingCoords = null;
    }
    
    // Закрытие модального окна
    document.getElementById('closeModal').onclick = closeModal;
    window.onclick = function (e) {
      if (e.target === document.getElementById('markerModal')) {
        closeModal();
      }
    };
    
    // Обработка отправки формы
    document.getElementById('markerForm').addEventListener('submit', function (e) {
      e.preventDefault();
    
      const name = document.getElementById('markerName').value.trim();
      const desc = document.getElementById('markerDesc').value.trim();
    
      if (!name || !desc || !pendingCoords) return;
    
      const marker = L.marker(pendingCoords).addTo(map);
      marker.bindPopup(`
        <strong>${name}</strong><br/>
        <em>${desc}</em>
      `).openPopup();
    
      closeModal();
    });
    
