
// ----------------------
// Récupération des champs formulaire
// ----------------------
function getFormValues() {
  return {
    lastName: document.getElementById("login-nom").value.trim(),
    firstName: document.getElementById("login-prenom").value.trim(),
    email: document.getElementById("login-email").value.trim(),
    password: document.getElementById("login-password").value.trim(),
    type: document.getElementById("login-type").value
  };
}


let currentUser = null;


// --- Vidéo intro ---
function skipIntro() {
document.getElementById('intro-screen').style.display = 'none';
document.getElementById('login-screen').style.display = 'block';
}


// --- Authentification ---
async function createAccount() {
const email = document.getElementById('login-email').value;
const password = document.getElementById('login-password').value;
const lastName = document.getElementById('login-nom').value;
const firstName = document.getElementById('login-prenom').value;
const type = document.getElementById('login-type').value;


const { user, error } = await supabase.auth.signUp({ email, password });
if (error) return alert(error.message);


await supabase.from('profiles').insert([{ id: user.id, email, type, nom: lastName, prenom: firstName }]);
alert('Compte créé ! Vérifie ton email pour confirmer.');
}


async function createAccount() {
const email = document.getElementById('login-email').value;
const password = document.getElementById('login-password').value;
const lastName = document.getElementById('login-nom').value;
const firstName = document.getElementById('login-prenom').value;
const type = document.getElementById('login-type').value;


const { user, error } = await supabase.auth.signUp({ email, password });
if (error) return alert(error.message);


await supabase.from('profiles').insert([{ id: user.id, email, type, nom: lastName, prenom: firstName }]);
alert('Compte créé ! Vérifie ton email pour confirmer.');
}


async function signIn() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const type = document.getElementById('login-type').value;


  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });


  if (error) {
    alert("Erreur de connexion : " + error.message);
  } else {
    showMainScreen(type);
  }
}


// --- Mot de passe oublié ---
async function forgotPassword() {
const email = prompt("Entrez votre email pour réinitialiser le mot de passe :");
if (!email) return;
const { error } = await supabase.auth.api.resetPasswordForEmail(email);
if (error) alert(error.message);
else alert('Email de réinitialisation envoyé !');
}


// --- Menu principal ---
function showCasting() {
  document.getElementById('content').innerHTML = `
    <h2>🎬 Castings en Belgique</h2>
    <div id="casting-list" class="casting-grid">
      <div class="casting-card">
        <img src="casting1.jpg" alt="Casting 1">
        <h3>Figurants pour série RTBF</h3>
        <p><strong>Lieu :</strong> Bruxelles</p>
        <p><strong>Âge :</strong> 18-60 ans</p>
        <p><strong>Rôle :</strong> Passants, clients café</p>
        <button class="blue-btn" onclick="showApplicationForm('Public pour émission RTL TVI')">Postuler</button>
 </div>


      <div class="casting-card">
        <img src="casting2.jpg" alt="Casting 2">
        <h3>Public pour émission RTL TVI</h3>
        <p><strong>Lieu :</strong> Liège</p>
        <p><strong>Âge :</strong> 20-70 ans</p>
        <p><strong>Rôle :</strong> Public plateau TV</p>
        <button class="blue-btn">Postuler</button>
      </div>


      <div class="casting-card">
        <img src="casting3.jpg" alt="Casting 3">
        <h3>Long métrage – "La Frontière"</h3>
        <p><strong>Lieu :</strong> Namur</p>
        <p><strong>Âge :</strong> 25-50 ans</p>
        <p><strong>Rôle :</strong> Ouvriers / figurants de gare</p>
        <button class="blue-btn">Postuler</button>
      </div>


      <div class="casting-card">
        <img src="casting4.jpg" alt="Casting 4">
        <h3>Campagne pub "Visit Brussels"</h3>
        <p><strong>Lieu :</strong> Bruxelles</p>
        <p><strong>Âge :</strong> 18-40 ans</p>
        <p><strong>Rôle :</strong> Jeunes touristes / couples</p>
        <button class="blue-btn">Postuler</button>
      </div>


      <div class="casting-card">
        <img src="casting5.jpg" alt="Casting 5">
        <h3>Clip musical – artiste belge</h3>
        <p><strong>Lieu :</strong> Charleroi</p>
        <p><strong>Âge :</strong> 16-30 ans</p>
        <p><strong>Rôle :</strong> Danseurs / figurants de foule</p>
        <button class="blue-btn">Postuler</button>
      </div>
    </div>
  `;
}


function showRideshare() {
  document.getElementById('content').innerHTML = `
    <h2>Covoiturage</h2>
    <div id="covoit-buttons">
      <button class="blue-btn" onclick="showRideshareForm()">Conducteur</button>
      <button class="blue-btn" onclick="showRideshareList()">Covoiturage</button>
    </div>
    <div id="covoit-section"></div>
  `;
}


function showRideshareForm() {
  document.getElementById('covoit-section').innerHTML = `
    <h3>Proposer un covoiturage</h3>
    <form id="form-covoiturage">
      <input type="text" id="projet" placeholder="Nom du projet / tournage" required>
      <input type="text" id="conducteur" placeholder="Nom du conducteur" required>
      <input type="text" id="trajet" placeholder="Trajet / zone de départ" required>
      <input type="date" id="date" required>
      <input type="time" id="heure" required>
      <input type="number" id="places" placeholder="Places disponibles" required>
      <select id="contact">
        <option value="email">Contact par email</option>
        <option value="tel">Contact par téléphone</option>
      </select>
      <button type="submit" class="blue-btn">Publier</button>
    </form>
  `;


  const form = document.getElementById('form-covoiturage');
  form.addEventListener('submit', (event) => {
    event.preventDefault();


    const project = document.getElementById('projet').value;
    const driver = document.getElementById('conducteur').value;
    const route = document.getElementById('trajet').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('heure').value;
    const seats = document.getElementById('places').value;
    const contact = document.getElementById('contact').value;


    const rideshares = JSON.parse(localStorage.getItem('rideshares') || '[]');
    rideshares.push({ project, driver, route, date, time, seats, contact });
    localStorage.setItem('rideshares', JSON.stringify(rideshares));


    alert("Covoiturage publié !");
    showRideshareList();
  });
}


function showRideshareList() {
  const rideshares = JSON.parse(localStorage.getItem('rideshares') || '[]');
  if (rideshares.length === 0) {
    document.getElementById('covoit-section').innerHTML = "<p>Aucun covoiturage publié pour le moment.</p>";
    return;
  }


  let html = "<h3>Liste des covoiturages disponibles</h3>";
  rideshares.forEach((c, idx) => {
    const contact = c.contact || '';
    const isEmail = contact.includes('@');
    const contactAction = isEmail
      ? `window.location.href = 'mailto:${contact}?subject=Proposition%20covoiturage%20pour%20${encodeURIComponent(c.project)}'`
      : `window.location.href = 'tel:${contact}'`;


    html += `
      <div class="covoit-card ${c.full ? 'complet' : ''}">
        <div class="covoit-row">
          <div class="covoit-left">
            <strong>${escapeHtml(c.project)}</strong><br>
            Conducteur : ${escapeHtml(c.driver)}<br>
            Départ : ${escapeHtml(c.route)}<br>
            Date : ${escapeHtml(c.date)} à ${escapeHtml(c.time)}<br>
            Places : ${escapeHtml(String(c.seats))}<br>
          </div>
          <div class="covoit-actions">
            <button class="blue-btn" ${c.full ? 'disabled' : `onclick="${contactAction}"`}>Contacter</button>
            ${c.full ? '' : `<button class="blue-btn" onclick="markComplete(${idx})">Marquer complet</button>`}
            <button class="blue-btn outline" onclick="deleteRide(${idx})">Supprimer</button>
          </div>
        </div>
      </div>
    `;
  });


  document.getElementById('covoit-section').innerHTML = html;
}




// --- FORMULAIRE CONDUCTEUR ---
function showRideshareFormPage() {
document.getElementById('content').innerHTML = `
  <h2>Proposer un covoiturage</h2>
  <form id="form-covoiturage">
    <input type="text" id="projet" placeholder="Nom du projet / tournage" required>
    <input type="text" id="conducteur" placeholder="Nom du conducteur" required>
    <input type="text" id="trajet" placeholder="Trajet / zone de départ" required>
    <input type="date" id="date" required>
    <input type="time" id="heure" required>
    <input type="number" id="places" placeholder="Places disponibles" required>
    <select id="contact">
      <option value="email">Contact par email</option>
      <option value="tel">Contact par téléphone</option>
    </select>
    <button type="submit" class="blue-btn">Publier</button>
  </form>
`;

}


function publishRide() {
  const project = document.getElementById('projet').value.trim();
  const driver = document.getElementById('conducteur').value.trim();
  const route = document.getElementById('trajet').value.trim();
  const date = document.getElementById('date').value;
  const time = document.getElementById('heure').value;
  const seats = document.getElementById('places').value;
  const contact = document.getElementById('contact').value.trim();


  if (!project || !driver || !route || !date || !time || !seats || !contact) {
    alert("Merci de remplir tous les champs !");
    return;
  }


  const rideshares = JSON.parse(localStorage.getItem('rideshares') || '[]');
  rideshares.push({
    project,
    driver,
    route,
    date,
    time,
    seats,
    contact,
    full: false
  });
  localStorage.setItem('rideshares', JSON.stringify(rideshares));


  alert("Covoiturage publié !");
  showRideshareList();
}


// --- LISTE DES TRAJETS ---
let rides = [];


function showRideList() {
  if (rides.length === 0) {
    document.getElementById('covoiturage-content').innerHTML = `<p>Aucun trajet pour le moment.</p>`;
    return;
  }


  let html = '<h3>Trajets disponibles</h3>';
  rides.forEach((t, i) => {
    html += `
      <div class="trajet">
        <p><strong>Conducteur :</strong> ${t.driverName}</p>
        <p><strong>Trajet :</strong> ${t.route}</p>
        <p><strong>Date :</strong> ${t.date}</p>
        <p><strong>Heure :</strong> ${t.time}</p>
        <p><strong>Places :</strong> ${t.seats}</p>
        <p><strong>Contact :</strong> ${t.contact}</p>
        <button class="blue-btn" onclick="markComplete(${i})">Complet</button>
        <button class="blue-btn" onclick="deleteRide(${i})">Supprimer</button>
      </div>
      <hr>
    `;
  });


  document.getElementById('covoiturage-content').innerHTML = html;
}


// --- PUBLIER UN TRAJET ---
function publishRideshare(event) {
  event.preventDefault();


  const newRide = {
    driverName: document.getElementById('nomConducteur').value,
    route: document.getElementById('trajet').value,
    date: document.getElementById('dateTrajet').value,
    time: document.getElementById('heureTrajet').value,
    seats: document.getElementById('places').value,
    contact: document.getElementById('contact').value,
    full: false
  };


  rides.push(newRide);
  showRideList();
}


// --- MARQUER COMPLET ---
function markComplete(index) {
  rides[index].full = true;
  rides[index].seats = "Complet";
  showRideList();
}


// --- SUPPRIMER UN TRAJET ---
function deleteRide(index) {
  rides.splice(index, 1);
  showRideList();
}


function showInfo() {
    document.getElementById('content').innerHTML = `
        <h2>Informations</h2>
<p>FigurAction aide les productions à organiser plus facilement leurs castings et tournages,
    et permet aux figurants de trouver des opportunités et du covoiturage.
    Voici un aperçu de la hiérarchie typique sur un plateau de tournage.</p>

        <ul class="info-list">
            <li onclick="showLegalNotice()">📄 Mentions légales</li>
            <li onclick="showTerms()">📘 Conditions d'utilisation</li>
            <li onclick="showPrivacyPolicy()">🔒 Politique de confidentialité</li>
            <li onclick="showOrgChart()">🎬 Organigramme cinéma</li>
            <li onclick="showPartners()">🤝 Partenaire</li>
        </ul>
    `;
}

function showContact() {
document.getElementById('content').innerHTML = '<h2>Contact</h2><p>Email : figuraction.casting@gmail.com</p>';
}


function showAdmin() {
document.getElementById('content').innerHTML = '<h2>Admin</h2><p>Liste de toutes les candidatures et projets ici.</p>';
}



let userProfile = {
  lastName: "Utilisateur",
  firstName: "Démonstration",
  email: "demo@figuraction.com",
  city: "Non précisé",
  age: "Non précisé",
  level: "Débutant"
};


function showProfile() {
  document.getElementById('content').innerHTML = `
    <h2>Mon Profil</h2>


    <p><strong>Nom :</strong> ${userProfile.lastName}</p>
    <p><strong>Prénom :</strong> ${userProfile.firstName}</p>
    <p><strong>Email :</strong> ${userProfile.email}</p>
    <p><strong>Ville :</strong> ${userProfile.city}</p>
    <p><strong>Âge :</strong> ${userProfile.age}</p>
    <p><strong>Niveau :</strong> ${userProfile.level}</p>


    <button class="blue-btn" onclick="editProfile()">Modifier mon profil</button>
  `;
}


function editProfile() {
  document.getElementById('content').innerHTML = `
    <h2>Modifier mon profil</h2>


    <label>Nom</label>
    <input id="edit-nom" value="${userProfile.lastName}">


    <label>Prénom</label>
    <input id="edit-prenom" value="${userProfile.firstName}">


    <label>Email</label>
    <input id="edit-email" type="email" value="${userProfile.email}">


    <label>Ville</label>
    <input id="edit-ville" value="${userProfile.city}">


    <label>Âge</label>
    <input id="edit-age" type="number" value="${userProfile.age}">


    <label>Niveau</label>
    <select id="edit-niveau">
      <option value="Débutant">Débutant</option>
      <option value="Première fois">Première fois</option>
      <option value="Confirmé">Confirmé</option>
    </select>


    <button class="blue-btn" onclick="saveProfile()">Enregistrer</button>
  `;


  document.getElementById("edit-niveau").value = userProfile.level;
}


function saveProfile() {
  userProfile.lastName = document.getElementById('edit-nom').value;
  userProfile.firstName = document.getElementById('edit-prenom').value;
  userProfile.email = document.getElementById('edit-email').value;
  userProfile.city = document.getElementById('edit-ville').value;
  userProfile.age = document.getElementById('edit-age').value;
  userProfile.level = document.getElementById('edit-niveau').value;


  showProfile();
}


function testLogin() {

  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'block';
  document.getElementById("candidats-menu").style.display = "none";

  document.querySelector("li[onclick='showCasting()']").style.display = "block";


  document.getElementById('main-screen').style.display = 'block';


  document.getElementById('projet-menu').style.display = 'block';


  showProjects();

    document.getElementById("projet-menu").style.display = "none";

    document.getElementById("contrat-menu").style.display = "block";
    document.getElementById("candidatures-menu").style.display = "block";

    showCasting();

}

function testProLogin() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'block';

    document.getElementById('main-screen').style.display = 'block';
    document.getElementById("candidats-menu").style.display = "block";

    const castMenu = document.querySelector("nav ul li[onclick='showCasting()']");
    if (castMenu) castMenu.style.display = 'none';

    document.getElementById('projet-menu').style.display = 'block';

    document.getElementById("contrat-menu").style.display = "none";
    document.getElementById("candidatures-menu").style.display = "none";

    showProjects();
}




function escapeHtml(str){ if(!str) return ''; return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s]));
}


function markComplete(index) {
  const rideshares = JSON.parse(localStorage.getItem('rideshares') || '[]');
  if (!rideshares[index]) return;
  rideshares[index].full = true;
  rideshares[index].seats = 0;
  localStorage.setItem('rideshares', JSON.stringify(rideshares));
  showRideshareList();
}


function deleteRide(index) {
  const rideshares = JSON.parse(localStorage.getItem('rideshares') || '[]');
  rideshares.splice(index, 1);
  localStorage.setItem('rideshares', JSON.stringify(rideshares));
  showRideshareList();
}


function showProjectForm() {
  document.getElementById('content').innerHTML = `
    <h2>Ajouter un projet</h2>
    <form id="form-projet" onsubmit="submitProject(event)">
      <label>Titre du projet :</label>
      <input type="text" id="projet-titre" placeholder="Ex: Tournage pub Coca-Cola" required>


      <label>Description :</label>
      <textarea id="projet-description" placeholder="Brève description du projet..." required></textarea>


      <label>Date ou période de tournage :</label>
      <input type="text" id="projet-date" placeholder="Ex: du 15 au 20 novembre" required>


      <label>Zone géographique :</label>
      <input type="text" id="projet-zone" placeholder="Ex: Bruxelles / Liège" required>


      <label>Type de rôle recherché :</label>
      <select id="projet-type" required>
        <option value="">Choisir...</option>
        <option value="figurant">Figurant</option>
        <option value="acteur">Acteur</option>
        <option value="double">Doublure</option>
      </select>


      <button type="submit" class="blue-btn">Publier le projet</button>
    </form>
  `;
}


function submitProject(event) {
  event.preventDefault();


  const project = {
    title: document.getElementById('projet-titre').value,
    description: document.getElementById('projet-description').value,
    date: document.getElementById('projet-date').value,
    zone: document.getElementById('projet-zone').value,
    type: document.getElementById('projet-type').value
  };


  alert(`Projet ajouté : ${project.title}\n(${project.zone})`);

}


function showMainScreen(type) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-screen').style.display = 'block';


  document.getElementById('admin-menu').style.display = 'none';
  const projectMenu = document.getElementById('projet-menu');
  if (projectMenu) projectMenu.style.display = 'none';


  if (type === "production" && projectMenu) {
    projectMenu.style.display = 'block';
  } else if (type === "admin") {
    document.getElementById('admin-menu').style.display = 'block';
  }


  document.getElementById('content').innerHTML = `<h2>Bienvenue sur FigurAction 👋</h2>`;
}


function showProjects() {
  document.getElementById('content').innerHTML = `
    <h2>Mes Projets (démo producteur)</h2>
    <form id="form-projet">
      <input type="text" id="titre" placeholder="Titre du projet" required>
      <textarea id="description" placeholder="Description du projet"></textarea>
      <input type="text" id="lieu" placeholder="Lieu du tournage">
      <input type="date" id="date" placeholder="Date de tournage">
      <input type="text" id="type" placeholder="Type de rôle recherché">
      <button class="blue-btn" type="button" onclick="addProject()">Ajouter le projet</button>
    </form>


    <div id="liste-projets"></div>
  `;
}


function addProject() {
  const title = document.getElementById('titre').value;
  const description = document.getElementById('description').value;
  const location = document.getElementById('lieu').value;
  const date = document.getElementById('date').value;
  const type = document.getElementById('type').value;


  if (!title) {
    alert("Merci de remplir au moins le titre !");
    return;
  }


  const projectHTML = `
    <div class="projet-card">
      <h3>${title}</h3>
      <p><strong>Description :</strong> ${description}</p>
      <p><strong>Lieu :</strong> ${location}</p>
      <p><strong>Date :</strong> ${date}</p>
      <p><strong>Rôle recherché :</strong> ${type}</p>
    </div>
  `;


  document.getElementById('liste-projets').innerHTML += projectHTML;
  document.getElementById('form-projet').reset();
}


function logout() {
    localStorage.removeItem("user");

    document.getElementById("main-screen").style.display = "none";

    document.getElementById("login-screen").style.display = "block";

    document.getElementById("login-nom").value = "";
    document.getElementById("login-prenom").value = "";
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    document.getElementById("login-type").value = "figurant";
}




function showLogin() {
  document.getElementById('content').innerHTML = `
    <div class="login-box">
      <h2 class="title">Connexion</h2>
      <input type="text" id="email" placeholder="Email">
      <input type="password" id="password" placeholder="Mot de passe">
      <button class="blue-btn" onclick="signIn()">Se connecter</button>
      <button class="blue-btn" onclick="testLogin()">Connexion test</button>
      <p><a href="#">Mot de passe oublié ?</a></p>
    </div>
  `;
}


// Cache le bouton déconnexion au démarrage
window.onload = () => {
  document.getElementById('logout-btn').style.display = 'none';
};


const video = document.getElementById('intro-video');
if (video) {
    video.play().catch(() => {
        setTimeout(() => {
            video.play();
        }, 500);
    });
}

function showOrgChart() {
    document.getElementById('content').innerHTML = `
        <h2>Organigramme du cinéma</h2>

        <div class="org-chart">
            <ul>
        <li>
          <div class="org-box">🎬 Producteur / Production exécutive</div>
          <ul>
            <li>
              <div class="org-box">👨‍💼 Réalisateur</div>
              <ul>
                <li>
                  <div class="org-box">🎥 Département Image</div>
                  <ul>
                    <li><div class="org-box">Chef opérateur</div></li>
                    <li><div class="org-box">Cadreur / Assistant caméra</div></li>
                    <li><div class="org-box">Électricien / Machiniste</div></li>
                  </ul>
                </li>
                <li>
                  <div class="org-box">🎧 Département Son</div>
                  <ul>
                    <li><div class="org-box">Chef opérateur son</div></li>
                    <li><div class="org-box">Perchman</div></li>
                  </ul>
                </li>
                <li>
                  <div class="org-box">🎨 Département Artistique</div>
                  <ul>
                    <li><div class="org-box">Chef décorateur</div></li>
                    <li><div class="org-box">Accessoiriste</div></li>
                    <li><div class="org-box">Costumier</div></li>
                    <li><div class="org-box">Maquilleur / Coiffeur</div></li>
                  </ul>
                </li>
                <li>
                  <div class="org-box">🎭 Département Casting</div>
                  <ul>
                    <li><div class="org-box">Directeur de casting</div></li>
                    <li><div class="org-box">Comédiens</div></li>
                    <li><div class="org-box">Figurants</div></li>
                  </ul>
                </li>
                <li>
                  <div class="org-box">📋 Département Régie</div>
                  <ul>
                    <li><div class="org-box">Régisseur général</div></li>
                    <li><div class="org-box">Régisseur adjoint</div></li>
                    <li><div class="org-box">Assistant de production</div></li>
                  </ul>
                </li>
                <li>
                  <div class="org-box">✂️ Département Post-Production</div>
                  <ul>
                    <li><div class="org-box">Monteur image</div></li>
                    <li><div class="org-box">Monteur son / Mixeur</div></li>
                    <li><div class="org-box">Coloriste / Étalo</div></li>
                    <li><div class="org-box">Effets spéciaux (VFX)</div></li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  `;
}



function showLegalNotice() {
    document.getElementById('content').innerHTML = `
        <h2>Mentions légales</h2>
        <p>
© 2025 FRIGURACTION
Tous droits réservés.
Cette application et son contenu sont protégés par les droits d'auteur et la législation belge sur la propriété intellectuelle.
Toute reproduction, distribution ou utilisation non autorisée du contenu est interdite.
</p>
    `;
}

function showTerms() {
    document.getElementById('content').innerHTML = `
        <h2>Conditions d'utilisation</h2>
        <p>Ton texte ici…</p>
    `;
}

function showPrivacyPolicy() {
    document.getElementById('content').innerHTML = `
        <h2>Politique de confidentialité</h2>
        <p>Ton texte ici…</p>
    `;
}

function showPartners() {
    document.getElementById('content').innerHTML = `
        <h2>Partenaires</h2>
        <p>Liste des partenaires, sponsors, collaborations, etc.</p>
    `;
}

function openCastingForm() {
  document.getElementById("content").innerHTML = `
    <h2>📩 Postuler au casting</h2>

    <form id="form-casting" class="formulaire-casting">

      <label>Nom :</label>
      <input type="text" id="cast-nom" placeholder="Votre nom">

      <label>Prénom :</label>
      <input type="text" id="cast-prenom" placeholder="Votre prénom">

      <label>Âge :</label>
      <input type="number" id="cast-age" placeholder="Votre âge">

      <label>Localité :</label>
      <input type="text" id="cast-localite" placeholder="Ex : Bruxelles">

      <label>Numéro de téléphone :</label>
      <input type="tel" id="cast-tel" placeholder="04xx / xx xx xx">

      <label>Photo (close-up ou entière) :</label>
      <input type="file" id="cast-photo" accept="image/*">

      <button class="blue-btn" onclick="submitApplication(); return false;">Envoyer</button>
    </form>
  `;
}


function showApplicationForm(castingTitle) {
  document.getElementById("content").innerHTML = `
    <h2>Postuler – ${castingTitle}</h2>

    <form id="form-postulation" class="formulaire-postulation">

      <label>Nom</label>
      <input type="text" id="post-nom" placeholder="Votre nom">

      <label>Prénom</label>
      <input type="text" id="post-prenom" placeholder="Votre prénom">

      <label>Âge</label>
      <input type="number" id="post-age" placeholder="Votre âge">

      <label>Localité</label>
      <input type="text" id="post-localite" placeholder="Votre ville">

      <label>Numéro de téléphone</label>
      <input type="text" id="post-tel" placeholder="Votre téléphone">

      <label>Photo (face / full body)</label>
      <input type="file" id="post-photo" accept="image/*">

      <button class="blue-btn" onclick="submitApplication('${castingTitle}')">Envoyer</button>
    </form>
  `;
}

function submitApplication(castingTitle) {
  alert("Votre candidature pour : " + castingTitle + " a bien été envoyée !");
}


function showContract() {
    document.getElementById("content").innerHTML = `
        <h2>📄 Contrat de participation</h2>
        <p>Veuillez lire attentivement le contrat ci-dessous puis signer.</p>

        <div class="contrat-box">
            <p>
            Je soussigné(e) certifie participer volontairement comme figurant(e),
            accepte les conditions de participation, autorise l'utilisation de mon image
            dans le cadre de la production, et confirme que les informations fournies
            sont correctes.
            </p>
        </div>

        <label>Signature :</label>
        <input type="text" id="signature" placeholder="Écrire votre nom ici">

        <button class="blue-btn" onclick="submitContract()">Signer et enregistrer</button>
    `;
}

function submitContract() {
    alert("Votre contrat est bien signé ✔️");
}



function showApplications() {
    document.getElementById("content").innerHTML = `
        <h2>📄 Mes candidatures</h2>

        <div class="candidature-card">
            <span>Figurant série RTBF</span>
            <span class="status attente">⏳</span>
        </div>

        <div class="candidature-card">
            <span>Émission RTL TVI</span>
            <span class="status valide">✔️</span>
        </div>

        <div class="candidature-card">
            <span>Film "La Frontière"</span>
            <span class="status refuse">❌</span>
        </div>
    `;
}




function showCandidates() {
    document.getElementById("content").innerHTML = `
        <h2>👥 Liste des candidats</h2>

        <div class="select-actions">
            <button class="blue-btn" onclick="selectAllCandidates()">Tout sélectionner</button>
            <button class="blue-btn" onclick="deselectAllCandidates()">Sélection individuelle</button>
        </div>

        <div id="liste-candidats" class="info-list">
            ${mockCandidates.map(c => `
                <div class="info-item">
                    <input type="checkbox" class="select-candidat">
                    <div onclick="openCandidateProfile('${c.id}')" style="flex:1; cursor:pointer;">
                        <strong>${c.lastName} ${c.firstName}</strong><br>
                        Âge : ${c.age} — ${c.city}<br>
                        Disponible : ${c.availability}
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

function selectAllCandidates() {
    document.querySelectorAll(".select-candidat").forEach(cb => cb.checked = true);
}

function deselectAllCandidates() {
    document.querySelectorAll(".select-candidat").forEach(cb => cb.checked = false);
}


const mockCandidates = [
    { id: "C1", lastName: "Dupont", firstName: "Marie", age: 28, city: "Bruxelles", availability: "12/03/2025" },
    { id: "C2", lastName: "Lambert", firstName: "Julien", age: 34, city: "Liège", availability: "15/03/2025" },
    { id: "C3", lastName: "Moreau", firstName: "Sarah", age: 22, city: "Namur", availability: "20/03/2025" }
];


function openCandidateProfile(id) {
    const c = mockCandidates.find(x => x.id === id);

    document.getElementById("content").innerHTML = `
        <h2>📄 Profil candidat</h2>

        <div class="profile-box">
            <p><strong>Nom :</strong> ${c.lastName}</p>
            <p><strong>Prénom :</strong> ${c.firstName}</p>
            <p><strong>Âge :</strong> ${c.age}</p>
            <p><strong>Localité :</strong> ${c.city}</p>
            <p><strong>Disponibilité :</strong> ${c.availability}</p>

            <button class="blue-btn" onclick="contactCandidate('${c.firstName}', '${c.lastName}')">📧 Contacter</button>
        </div>
    `;
}

function contactCandidate(firstName, lastName) {
    window.location.href = `mailto:${firstName.toLowerCase()}.${lastName.toLowerCase()}@mail.com`;
}
