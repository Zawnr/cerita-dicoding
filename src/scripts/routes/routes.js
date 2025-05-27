import HomePage from '../pages/home/home-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import AboutPage from '../pages/about/about-page';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import AddStoryPage from '../pages/story/add-story-page';
import AddStoryPresenter from '../pages/story/add-story-presenter';


const routes = {
  '/login': {
    page: new LoginPage(),
    render: async () => {
      const page = routes['/login'].page;
      const html = page.render();
      await page.afterRender(); 
      return html;
    }
  },

  '/register': {
    page: new RegisterPage(),
    render: async () => {
      const page = routes['/register'].page;
      const html = page.render();
      await page.afterRender(); 
      return html;
  }
  },

  '/': {
    page: new HomePage(),
    render: () => routes['/'].page.render()
  },

    '/about': {
    page: new AboutPage(),
    render: () => routes['/about'].page.render()
  },

'/add-story': {
    page: new AddStoryPage(),
    render: async () => {
      const page = routes['/add-story'].page;
      const html = page.render();
      page.setPresenter(AddStoryPresenter);
      return html;
    },
    afterRender: async () => {
      console.log('[DEBUG] Start afterRender'); 
      try {
        const presenter = new AddStoryPresenter(routes['/add-story'].page);
        await presenter.init();
        console.log('[DEBUG] Presenter ready');
      } catch (error) {
        console.error('[ERROR] Presenter init:', error);
      }
  }
},

  '/stories/:id': {
    page: new StoryDetailPage(),
    render: (params) => routes['/stories/:id'].page.render(params)
    }
  };


export default routes;