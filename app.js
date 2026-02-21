
// ----------------------
// Récupération des champs formulaire
// ----------------------
function getFormValues() {
  return {
    nom: document.getElementById("login-nom").value.trim(),
    prenom: document.getElementById("login-prenom").value.trim(),
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
async function creerCompte() {
const email = document.getElementById('login-email').value;
const password = document.getElementById('login-password').value;
const nom = document.getElementById('login-nom').value;
const prenom = document.getElementById('login-prenom').value;
const type = document.getElementById('login-type').value;


const { user, error } = await supabase.auth.signUp({ email, password });
if (error) return alert(error.message);


await supabase.from('profiles').insert([{ id: user.id, email, type, nom, prenom }]);
alert('Compte créé ! Vérifie ton email pour confirmer.');
}


async function creerCompte() {
const email = document.getElementById('login-email').value;
const password = document.getElementById('login-password').value;
const nom = document.getElementById('login-nom').value;
const prenom = document.getElementById('login-prenom').value;
const type = document.getElementById('login-type').value;


const { user, error } = await supabase.auth.signUp({ email, password });
if (error) return alert(error.message);


await supabase.from('profiles').insert([{ id: user.id, email, type, nom, prenom }]);
alert('Compte créé ! Vérifie ton email pour confirmer.');
}


async function seConnecter() {
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
    afficherMainScreen(type);
  }
}


// --- Mot de passe oublié ---
async function motDePasseOublie() {
const email = prompt("Entrez votre email pour réinitialiser le mot de passe :");
if (!email) return;
const { error } = await supabase.auth.api.resetPasswordForEmail(email);
if (error) alert(error.message);
else alert('Email de réinitialisation envoyé !');
}


// --- Menu principal ---
function afficherCasting() {
  document.getElementById('content').innerHTML = `
    <h2>🎬 Castings en Belgique</h2>
    <div id="casting-list" class="casting-grid">
      <div class="casting-card">
        <img src="casting1.jpg" alt="Casting 1">
        <h3>Figurants pour série RTBF</h3>
        <p><strong>Lieu :</strong> Bruxelles</p>
        <p><strong>Âge :</strong> 18-60 ans</p>
        <p><strong>Rôle :</strong> Passants, clients café</p>
        <button class="blue-btn" onclick="afficherFormulairePostulation('Public pour émission RTL TVI')">Postuler</button>
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
        <h3>Long métrage – “La Frontière”</h3>
        <p><strong>Lieu :</strong> Namur</p>
        <p><strong>Âge :</strong> 25-50 ans</p>
        <p><strong>Rôle :</strong> Ouvriers / figurants de gare</p>
        <button class="blue-btn">Postuler</button>
      </div>


      <div class="casting-card">
        <img src="casting4.jpg" alt="Casting 4">
        <h3>Campagne pub “Visit Brussels”</h3>
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


function afficherCovoiturage() {
  document.getElementById('content').innerHTML = `
    <h2>Covoiturage</h2>
    <div id="covoit-buttons">
      <button class="blue-btn" onclick="afficherFormulaireCovoit()">Conducteur</button>
      <button class="blue-btn" onclick="afficherListeCovoit()">Covoiturage</button>
    </div>
    <div id="covoit-section"></div>
  `;
}


function afficherFormulaireCovoit() {
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


  // Empêcher le rechargement de la page
  const form = document.getElementById('form-covoiturage');
  form.addEventListener('submit', (event) => {
    event.preventDefault();


    const projet = document.getElementById('projet').value;
    const conducteur = document.getElementById('conducteur').value;
    const trajet = document.getElementById('trajet').value;
    const date = document.getElementById('date').value;
    const heure = document.getElementById('heure').value;
    const places = document.getElementById('places').value;
    const contact = document.getElementById('contact').value;


    // Sauvegarde temporaire
    const covoits = JSON.parse(localStorage.getItem('covoits') || '[]');
    covoits.push({ projet, conducteur, trajet, date, heure, places, contact });
    localStorage.setItem('covoits', JSON.stringify(covoits));


    alert("Covoiturage publié !");
    afficherListeCovoit();
  });
}


function afficherListeCovoit() {
  const covoits = JSON.parse(localStorage.getItem('covoits') || '[]');
  if (covoits.length === 0) {
    document.getElementById('covoit-section').innerHTML = "<p>Aucun covoiturage publié pour le moment.</p>";
    return;
  }


  let html = "<h3>Liste des covoiturages disponibles</h3>";
  covoits.forEach((c, idx) => {
    // construire le contact : si type contient '@' on considère email sinon téléphone
    const contact = c.contact || '';
    const isEmail = contact.includes('@');
    const contactAction = isEmail
      ? `window.location.href = 'mailto:${contact}?subject=Proposition%20covoiturage%20pour%20${encodeURIComponent(c.projet)}'`
      : `window.location.href = 'tel:${contact}'`;


    html += `
      <div class="covoit-card ${c.complet ? 'complet' : ''}">
        <div class="covoit-row">
          <div class="covoit-left">
            <strong>${escapeHtml(c.projet)}</strong><br>
            Conducteur : ${escapeHtml(c.conducteur)}<br>
            Départ : ${escapeHtml(c.trajet)}<br>
            Date : ${escapeHtml(c.date)} à ${escapeHtml(c.heure)}<br>
            Places : ${escapeHtml(String(c.places))}<br>
          </div>
          <div class="covoit-actions">
            <button class="blue-btn" ${c.complet ? 'disabled' : `onclick="${contactAction}"`}>Contacter</button>
            ${c.complet ? '' : `<button class="blue-btn" onclick="marquerComplet(${idx})">Marquer complet</button>`}
            <button class="blue-btn outline" onclick="supprimerTrajet(${idx})">Supprimer</button>
          </div>
        </div>
      </div>
    `;
  });


  document.getElementById('covoit-section').innerHTML = html;
}




// --- FORMULAIRE CONDUCTEUR ---
function afficherFormulaireCovoiturage() {
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


function publierCovoit() {
  const projet = document.getElementById('projet').value.trim();
  const conducteur = document.getElementById('conducteur').value.trim();
  const trajet = document.getElementById('trajet').value.trim();
  const date = document.getElementById('date').value;
  const heure = document.getElementById('heure').value;
  const places = document.getElementById('places').value;
  const contact = document.getElementById('contact').value.trim();


  if (!projet || !conducteur || !trajet || !date || !heure || !places || !contact) {
    alert("Merci de remplir tous les champs !");
    return;
  }


  // ✅ Enregistrement local
  const covoits = JSON.parse(localStorage.getItem('covoits') || '[]');
  covoits.push({
    projet,
    conducteur,
    trajet,
    date,
    heure,
    places,
    contact,
    complet: false
  });
  localStorage.setItem('covoits', JSON.stringify(covoits));


  alert("Covoiturage publié !");
  afficherListeCovoit();
}


// --- LISTE DES TRAJETS ---
let trajets = [];


function afficherListeCovoiturage() {
  if (trajets.length === 0) {
    document.getElementById('covoiturage-content').innerHTML = `<p>Aucun trajet pour le moment.</p>`;
    return;
  }


  let html = '<h3>Trajets disponibles</h3>';
  trajets.forEach((t, i) => {
    html += `
      <div class="trajet">
        <p><strong>Conducteur :</strong> ${t.nom}</p>
        <p><strong>Trajet :</strong> ${t.trajet}</p>
        <p><strong>Date :</strong> ${t.date}</p>
        <p><strong>Heure :</strong> ${t.heure}</p>
        <p><strong>Places :</strong> ${t.places}</p>
        <p><strong>Contact :</strong> ${t.contact}</p>
        <button class="blue-btn" onclick="marquerComplet(${i})">Complet</button>
        <button class="blue-btn" onclick="supprimerTrajet(${i})">Supprimer</button>
      </div>
      <hr>
    `;
  });


  document.getElementById('covoiturage-content').innerHTML = html;
}


// --- PUBLIER UN TRAJET ---
function publierCovoiturage(event) {
  event.preventDefault();


  const nouveauTrajet = {
    nom: document.getElementById('nomConducteur').value,
    trajet: document.getElementById('trajet').value,
    date: document.getElementById('dateTrajet').value,
    heure: document.getElementById('heureTrajet').value,
    places: document.getElementById('places').value,
    contact: document.getElementById('contact').value,
    complet: false
  };


  trajets.push(nouveauTrajet);
  afficherListeCovoiturage();
}


// --- MARQUER COMPLET ---
function marquerComplet(index) {
  trajets[index].complet = true;
  trajets[index].places = "Complet";
  afficherListeCovoiturage();
}


// --- SUPPRIMER UN TRAJET ---
function supprimerTrajet(index) {
  trajets.splice(index, 1);
  afficherListeCovoiturage();
}


function afficherInfos() {
    document.getElementById('content').innerHTML = `
        <h2>Informations</h2>
<p>FigurAction aide les productions à organiser plus facilement leurs castings et tournages,
    et permet aux figurants de trouver des opportunités et du covoiturage.
    Voici un aperçu de la hiérarchie typique sur un plateau de tournage.</p>

        <ul class="info-list">
            <li onclick="afficherMentionsLegales()">📄 Mentions légales</li>
            <li onclick="afficherConditions()">📘 Conditions d'utilisation</li>
            <li onclick="afficherConfidentialite()">🔒 Politique de confidentialité</li>
            <li onclick="afficherOrganigramme()">🎬 Organigramme cinéma</li>
            <li onclick="afficherpartenaire()">🤝 Partenaire</li>
        </ul>
    `;
}

function afficherContact() {
document.getElementById('content').innerHTML = '<h2>Contact</h2><p>Email : figuraction.casting@gmail.com</p>';
}


function afficherAdmin() {
document.getElementById('content').innerHTML = '<h2>Admin</h2><p>Liste de toutes les candidatures et projets ici.</p>';
}



let profil = {
  nom: "Utilisateur",
  prenom: "Démonstration",
  email: "demo@figuraction.com",
  ville: "Non précisé",
  age: "Non précisé",
  niveau: "Débutant"
};


function afficherProfil() {
  document.getElementById('content').innerHTML = `
    <h2>Mon Profil</h2>


    <p><strong>Nom :</strong> ${profil.nom}</p>
    <p><strong>Prénom :</strong> ${profil.prenom}</p>
    <p><strong>Email :</strong> ${profil.email}</p>
    <p><strong>Ville :</strong> ${profil.ville}</p>
    <p><strong>Âge :</strong> ${profil.age}</p>
    <p><strong>Niveau :</strong> ${profil.niveau}</p>


    <button class="blue-btn" onclick="modifierProfil()">Modifier mon profil</button>
  `;
}


function modifierProfil() {
  document.getElementById('content').innerHTML = `
    <h2>Modifier mon profil</h2>


    <label>Nom</label>
    <input id="edit-nom" value="${profil.nom}">


    <label>Prénom</label>
    <input id="edit-prenom" value="${profil.prenom}">


    <label>Email</label>
    <input id="edit-email" type="email" value="${profil.email}">


    <label>Ville</label>
    <input id="edit-ville" value="${profil.ville}">


    <label>Âge</label>
    <input id="edit-age" type="number" value="${profil.age}">


    <label>Niveau</label>
    <select id="edit-niveau">
      <option value="Débutant">Débutant</option>
      <option value="Première fois">Première fois</option>
      <option value="Confirmé">Confirmé</option>
    </select>


    <button class="blue-btn" onclick="sauverProfil()">Enregistrer</button>
  `;


  // Sélectionne la valeur actuelle du niveau
  document.getElementById("edit-niveau").value = profil.niveau;
}


function sauverProfil() {
  profil.nom = document.getElementById('edit-nom').value;
  profil.prenom = document.getElementById('edit-prenom').value;
  profil.email = document.getElementById('edit-email').value;
  profil.ville = document.getElementById('edit-ville').value;
  profil.age = document.getElementById('edit-age').value;
  profil.niveau = document.getElementById('edit-niveau').value;


  // Retour au profil mis à jour
  afficherProfil();
}


function connexionTest() {

  // cacher l’écran de connexion
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'block';
  document.getElementById("candidats-menu").style.display = "none";

 // Affiche CASTING pour le test figurant
    document.querySelector("li[onclick='afficherCasting()']").style.display = "block";


  // afficher le contenu principal
  document.getElementById('main-screen').style.display = 'block';


  // simuler un compte producteur
  document.getElementById('projet-menu').style.display = 'block';


  // ouvrir directement la page projets
  afficherProjets();

      // Cacher l’onglet projets pour le mode test figurant
    document.getElementById("projet-menu").style.display = "none";

        // Montrer CONTRAT que dans connexion test
    document.getElementById("contrat-menu").style.display = "block";
    document.getElementById("candidatures-menu").style.display = "block";

    afficherCasting();

}

function connexionProTest() {
    // Cacher écran de connexion
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'block';

    // Afficher écran principal
    document.getElementById('main-screen').style.display = 'block';
    document.getElementById("candidats-menu").style.display = "block";

    // Masquer l'onglet CASTING
    const castMenu = document.querySelector("nav ul li[onclick='afficherCasting()']");
    if (castMenu) castMenu.style.display = 'none';

    // Afficher menu PROJET
    document.getElementById('projet-menu').style.display = 'block';

    // Charger la page projets directement

    // Ne pas montrer CONTRAT dans connexionProTest
    document.getElementById("contrat-menu").style.display = "none";
    document.getElementById("candidatures-menu").style.display = "none";

    afficherProjets();
}




function escapeHtml(str){ if(!str) return ''; return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s]));
}


function marquerComplet(index) {
  const covoits = JSON.parse(localStorage.getItem('covoits') || '[]');
  if (!covoits[index]) return;
  covoits[index].complet = true;
  // optionnel : mettre places à 0 ou "Complet"
  covoits[index].places = 0;
  localStorage.setItem('covoits', JSON.stringify(covoits));
  afficherListeCovoit();
}


function supprimerTrajet(index) {
  const covoits = JSON.parse(localStorage.getItem('covoits') || '[]');
  covoits.splice(index, 1);
  localStorage.setItem('covoits', JSON.stringify(covoits));
  afficherListeCovoit();
}


function afficherFormulaireProjet() {
  document.getElementById('content').innerHTML = `
    <h2>Ajouter un projet</h2>
    <form id="form-projet" onsubmit="soumettreProjet(event)">
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


function soumettreProjet(event) {
  event.preventDefault();


  const projet = {
    titre: document.getElementById('projet-titre').value,
    description: document.getElementById('projet-description').value,
    date: document.getElementById('projet-date').value,
    zone: document.getElementById('projet-zone').value,
    type: document.getElementById('projet-type').value
  };


  // Pour l’instant : simulation d’enregistrement local
  alert(`Projet ajouté : ${projet.titre}\n(${projet.zone})`);


  // Ensuite, tu pourras remplacer ça par un envoi vers Supabase
}


function afficherMainScreen(type) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-screen').style.display = 'block';


  // Masquer tous les menus spéciaux d’abord
  document.getElementById('admin-menu').style.display = 'none';
  const projetMenu = document.getElementById('projet-menu');
  if (projetMenu) projetMenu.style.display = 'none';


  // Afficher selon le type
  if (type === "production" && projetMenu) {
    projetMenu.style.display = 'block';
  } else if (type === "admin") {
    document.getElementById('admin-menu').style.display = 'block';
  }


  document.getElementById('content').innerHTML = `<h2>Bienvenue sur FigurAction 👋</h2>`;
}


function afficherProjets() {
  document.getElementById('content').innerHTML = `
    <h2>Mes Projets (démo producteur)</h2>
    <form id="form-projet">
      <input type="text" id="titre" placeholder="Titre du projet" required>
      <textarea id="description" placeholder="Description du projet"></textarea>
      <input type="text" id="lieu" placeholder="Lieu du tournage">
      <input type="date" id="date" placeholder="Date de tournage">
      <input type="text" id="type" placeholder="Type de rôle recherché">
      <button class="blue-btn" type="button" onclick="ajouterProjet()">Ajouter le projet</button>
    </form>


    <div id="liste-projets"></div>
  `;
}


function ajouterProjet() {
  const titre = document.getElementById('titre').value;
  const description = document.getElementById('description').value;
  const lieu = document.getElementById('lieu').value;
  const date = document.getElementById('date').value;
  const type = document.getElementById('type').value;


  if (!titre) {
    alert("Merci de remplir au moins le titre !");
    return;
  }


  const projetHTML = `
    <div class="projet-card">
      <h3>${titre}</h3>
      <p><strong>Description :</strong> ${description}</p>
      <p><strong>Lieu :</strong> ${lieu}</p>
      <p><strong>Date :</strong> ${date}</p>
      <p><strong>Rôle recherché :</strong> ${type}</p>
    </div>
  `;


  document.getElementById('liste-projets').innerHTML += projetHTML;
  document.getElementById('form-projet').reset();
}


function deconnecter() {
    // Effacer la session locale
    localStorage.removeItem("user");

    // Cacher le menu
    document.getElementById("main-screen").style.display = "none";

    // Afficher l’écran de connexion + inscription
    document.getElementById("login-screen").style.display = "block";

    // Réinitialiser le formulaire
    document.getElementById("login-nom").value = "";
    document.getElementById("login-prenom").value = "";
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    document.getElementById("login-type").value = "figurant";
}




function afficherLogin() {
  document.getElementById('content').innerHTML = `
    <div class="login-box">
      <h2 class="title">Connexion</h2>
      <input type="text" id="email" placeholder="Email">
      <input type="password" id="password" placeholder="Mot de passe">
      <button class="blue-btn" onclick="connexion()">Se connecter</button>
      <button class="blue-btn" onclick="connexionTest()">Connexion test</button>
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
        // iOS bloque parfois → on force un deuxième play
        setTimeout(() => {
            video.play();
        }, 500);
    });
}

function afficherOrganigramme() {
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



function afficherMentionsLegales() {
    document.getElementById('content').innerHTML = `
        <h2>Mentions légales</h2>
        <p>
© 2025 FRIGURACTION
Tous droits réservés. 
Cette application et son contenu sont protégés par les droits d’auteur et la législation belge sur la propriété intellectuelle. 
Toute reproduction, distribution ou utilisation non autorisée du contenu est interdite.
</p>
    `;
}

function afficherConditions() {
    document.getElementById('content').innerHTML = `
        <h2>Conditions d'utilisation</h2>
        <p>Ton texte ici…</p>
    `;
}

function afficherConfidentialite() {
    document.getElementById('content').innerHTML = `
        <h2>Politique de confidentialité</h2>
        <p>Ton texte ici…</p>
    `;
}

function afficherPartenaire() {
    document.getElementById('content').innerHTML = `
        <h2>Partenaires</h2>
        <p>Liste des partenaires, sponsors, collaborations, etc.</p>
    `;
}

function ouvrirFormulaireCasting() {
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

      <button class="blue-btn" onclick="envoyerCandidature(); return false;">Envoyer</button>
    </form>
  `;
}


function afficherFormulairePostulation(titreCasting) {
  document.getElementById("content").innerHTML = `
    <h2>Postuler – ${titreCasting}</h2>

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

      <button class="blue-btn" onclick="envoyerCandidature('${titreCasting}')">Envoyer</button>
    </form>
  `;
}

function envoyerCandidature(titreCasting) {
  alert("Votre candidature pour : " + titreCasting + " a bien été envoyée !");
}


function afficherContrat() {
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

        <button class="blue-btn" onclick="soumettreContrat()">Signer et enregistrer</button>
    `;
}

function soumettreContrat() {
    alert("Votre contrat est bien signé ✔️");
}



function afficherCandidatures() {
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
            <span>Film “La Frontière”</span>
            <span class="status refuse">❌</span>
        </div>
    `;
}




function afficherCandidats() {
    document.getElementById("content").innerHTML = `
        <h2>👥 Liste des candidats</h2>

        <div class="select-actions">
            <button class="blue-btn" onclick="selectionnerTousCandidats()">Tout sélectionner</button>
            <button class="blue-btn" onclick="desactiverSelectionTous()">Sélection individuelle</button>
        </div>

        <div id="liste-candidats" class="info-list">
            ${candidatsFake.map(c => `
                <div class="info-item">
                    <input type="checkbox" class="select-candidat">
                    <div onclick="ouvrirProfilCandidat('${c.id}')" style="flex:1; cursor:pointer;">
                        <strong>${c.nom} ${c.prenom}</strong><br>
                        Âge : ${c.age} — ${c.localite}<br>
                        Disponible : ${c.disponibilite}
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

function selectionnerTousCandidats() {
    document.querySelectorAll(".select-candidat").forEach(cb => cb.checked = true);
}

function desactiverSelectionTous() {
    document.querySelectorAll(".select-candidat").forEach(cb => cb.checked = false);
}


const candidatsFake = [
    { id: "C1", nom: "Dupont", prenom: "Marie", age: 28, localite: "Bruxelles", disponibilite: "12/03/2025" },
    { id: "C2", nom: "Lambert", prenom: "Julien", age: 34, localite: "Liège", disponibilite: "15/03/2025" },
    { id: "C3", nom: "Moreau", prenom: "Sarah", age: 22, localite: "Namur", disponibilite: "20/03/2025" }
];


function ouvrirProfilCandidat(id) {
    const c = candidatsFake.find(x => x.id === id);

    document.getElementById("content").innerHTML = `
        <h2>📄 Profil candidat</h2>

        <div class="profile-box">
            <p><strong>Nom :</strong> ${c.nom}</p>
            <p><strong>Prénom :</strong> ${c.prenom}</p>
            <p><strong>Âge :</strong> ${c.age}</p>
            <p><strong>Localité :</strong> ${c.localite}</p>
            <p><strong>Disponibilité :</strong> ${c.disponibilite}</p>

            <button class="blue-btn" onclick="contacterCandidat('${c.prenom}', '${c.nom}')">📧 Contacter</button>
        </div>
    `;
}

function contacterCandidat(prenom, nom) {
    window.location.href = `mailto:${prenom.toLowerCase()}.${nom.toLowerCase()}@mail.com`;
}



