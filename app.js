document.addEventListener('DOMContentLoaded', () => {
  // Selectores del DOM
  const body = document.body;
  const themeButton = document.getElementById('btn-theme');
  const exportButton = document.getElementById('btn-export');
  const searchInput = document.getElementById('search');
  const addButton = document.getElementById('btn-add');
  const marginRange = document.getElementById('margin-range');
  const pageIndicator = document.getElementById('page-indicator');
  const heroAddButton = document.getElementById('hero-add');
  const projectNavButtons = document.querySelectorAll('.goto');
  const navButtons = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.page');
  const filterTabs = document.querySelectorAll('.tab');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  const pager = document.getElementById('pager');
  const cardsGrid = document.getElementById('cards');
  const autosaveCheckbox = document.getElementById('autosave');
  const perPageInput = document.getElementById('per-page');
  const importButton = document.getElementById('btn-import');
  const resetButton = document.getElementById('btn-reset');
  const newDialog = document.getElementById('dialog-new');
  const newForm = document.getElementById('form-new');
  const newTitleInput = document.getElementById('new-title');
  const newDescTextarea = document.getElementById('new-desc');
  const newTagsInput = document.getElementById('new-tags');
  const cancelNewButton = document.getElementById('cancel-new');
  const acceptNewButton = document.getElementById('accept-new');
  const fileImportInput = document.getElementById('file-import');

  let projects = [];
  let currentPage = 'home';

  const saveProjects = () => {
    localStorage.setItem('projects', JSON.stringify(projects));
  };

  const loadProjects = () => {
    const saved = localStorage.getItem('projects');
    if (saved) {
      projects = JSON.parse(saved);
    } else {
      // Datos de ejemplo si no hay nada guardado
      projects = [
        { id: 1, title: "Proyecto Ejemplo 1", desc: "Descripción del proyecto 1", tags: ["dev", "web"], fav: true, date: Date.now() },
        { id: 2, title: "Proyecto Ejemplo 2", desc: "Descripción del proyecto 2", tags: ["design"], fav: false, date: Date.now() - 100000 },
      ];
    }
  };

  // Navegación
  const showPage = (pageId) => {
    pages.forEach(page => {
      page.classList.toggle('visible', page.id === `page-${pageId}`);
    });
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });
    currentPage = pageId;
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  projectNavButtons.forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  // Cambio de Tema
  let currentTheme = localStorage.getItem('theme') || 'light';

  const setTheme = (theme) => {
    body.dataset.theme = theme;
    themeButton.textContent = `Tema: ${theme === 'light' ? 'Claro' : 'Oscuro'}`;
    localStorage.setItem('theme', theme);
    currentTheme = theme;
  };

  themeButton.addEventListener('click', () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });

  // Renderizado, Paginación y Filtrado
  let currentFilter = 'all';
  let currentPageIndex = 0;
  let projectsPerPage = parseInt(perPageInput.value, 10);
  let searchTerm = '';

  const renderProjects = () => {
    let filteredProjects = projects;

    // Filtrar
    if (currentFilter === 'fav') {
      filteredProjects = projects.filter(p => p.fav);
    } else if (currentFilter === 'recent') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      filteredProjects = projects.filter(p => p.date >= sevenDaysAgo);
    }

    // Buscar
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filteredProjects = filteredProjects.filter(p =>
        p.title.toLowerCase().includes(lowerCaseSearch) ||
        p.tags.some(t => t.toLowerCase().includes(lowerCaseSearch))
      );
    }

    // Paginar
    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / projectsPerPage));
    currentPageIndex = Math.min(currentPageIndex, totalPages - 1);

    const start = currentPageIndex * projectsPerPage;
    const end = start + projectsPerPage;
    const paginatedProjects = filteredProjects.slice(start, end);

    // Renderizar
    cardsGrid.innerHTML = '';
    if (paginatedProjects.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No hay proyectos que mostrar.';
      cardsGrid.appendChild(p);
    } else {
      paginatedProjects.forEach(project => {
        const card = document.createElement('article');
        card.className = 'card';
        card.dataset.id = project.id;

        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';

        const title = document.createElement('h3');
        title.setAttribute('contenteditable', 'true');
        title.dataset.field = 'title';
        title.textContent = project.title;

        const favButton = document.createElement('button');
        favButton.className = `fav-btn ${project.fav ? 'active' : ''}`;
        favButton.title = 'Favorito';
        favButton.textContent = '♥';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.title = 'Eliminar';
        deleteButton.textContent = '🗑️';

        cardHeader.appendChild(title);
        cardHeader.appendChild(favButton);
        cardHeader.appendChild(deleteButton);

        const desc = document.createElement('p');
        desc.setAttribute('contenteditable', 'true');
        desc.dataset.field = 'desc';
        desc.textContent = project.desc;

        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'tags';
        tagsDiv.setAttribute('contenteditable', 'true');
        tagsDiv.dataset.field = 'tags';
        project.tags.forEach(tag => {
          const span = document.createElement('span');
          span.textContent = tag;
          tagsDiv.appendChild(span);
        });

        card.appendChild(cardHeader);
        card.appendChild(desc);
        card.appendChild(tagsDiv);

        cardsGrid.appendChild(card);
      });
    }

    // Actualizar UI de paginación
    pager.textContent = `${currentPageIndex + 1} / ${totalPages}`;
    prevPageButton.disabled = currentPageIndex === 0;
    nextPageButton.disabled = currentPageIndex >= totalPages - 1;
    pageIndicator.textContent = `Página ${currentPageIndex + 1}`;
  };

  // Event Listeners para filtrado y paginación
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentFilter = tab.dataset.filter;
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPageIndex = 0;
      renderProjects();
    });
  });

  searchInput.addEventListener('input', e => {
    searchTerm = e.target.value;
    currentPageIndex = 0;
    renderProjects();
  });

  prevPageButton.addEventListener('click', () => {
    if (currentPageIndex > 0) {
      currentPageIndex--;
      renderProjects();
    }
  });

  nextPageButton.addEventListener('click', () => {
    currentPageIndex++;
    renderProjects();
  });

  perPageInput.addEventListener('change', () => {
    projectsPerPage = parseInt(perPageInput.value, 10);
    currentPageIndex = 0;
    renderProjects();
  });

  marginRange.addEventListener('input', e => {
    cardsGrid.style.gap = `${e.target.value}px`;
  });

  // Lógica para añadir nuevos proyectos
  const openNewDialog = () => newDialog.showModal();
  const closeNewDialog = () => newDialog.close();

  addButton.addEventListener('click', openNewDialog);
  heroAddButton.addEventListener('click', openNewDialog);
  cancelNewButton.addEventListener('click', closeNewDialog);

  newForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newProject = {
      id: Date.now(),
      title: newTitleInput.value,
      desc: newDescTextarea.value,
      tags: newTagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean),
      fav: false,
      date: Date.now(),
    };
    projects.unshift(newProject);
    saveProjects();
    renderProjects();
    newForm.reset();
    closeNewDialog();
    showPage('projects');
  });

  // Importar, Exportar, Resetear
  exportButton.addEventListener('click', () => {
    const json = JSON.stringify(projects, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  importButton.addEventListener('click', () => {
    fileImportInput.click();
  });

  fileImportInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const importedProjects = JSON.parse(reader.result);
          if (Array.isArray(importedProjects)) {
            projects = importedProjects;
            saveProjects();
            renderProjects();
          }
        } catch (error) {
          alert('Error al importar el archivo JSON.');
        }
      };
      reader.readAsText(file);
    }
  });

  resetButton.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres resetear los datos a los ejemplos iniciales?')) {
      localStorage.removeItem('projects');
      loadProjects(); // Carga los datos de ejemplo
      renderProjects();
    }
  });

  let autosaveEnabled = autosaveCheckbox.checked;

  autosaveCheckbox.addEventListener('change', () => {
    autosaveEnabled = autosaveCheckbox.checked;
  });

  cardsGrid.addEventListener('focusout', e => {
    if (autosaveEnabled && e.target.hasAttribute('contenteditable')) {
      const card = e.target.closest('.card');
      const projectId = parseInt(card.dataset.id, 10);
      const project = projects.find(p => p.id === projectId);
      const field = e.target.dataset.field;

      if (project && field) {
        if (field === 'tags') {
          const tags = [...e.target.querySelectorAll('span')].map(span => span.textContent.trim()).filter(Boolean);
          project.tags = tags;
        } else {
          project[field] = e.target.textContent;
        }
        saveProjects();
      }
    }
  });

  cardsGrid.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;

    const projectId = parseInt(card.dataset.id, 10);
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (e.target.matches('.fav-btn')) {
      project.fav = !project.fav;
      saveProjects();
      renderProjects();
    }

    if (e.target.matches('.delete-btn')) {
      if (confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.title}"?`)) {
        projects = projects.filter(p => p.id !== projectId);
        saveProjects();
        renderProjects();
      }
    }
  });

  // Estado inicial
  loadProjects();
  showPage('home');
  setTheme(currentTheme);
  renderProjects();
});
