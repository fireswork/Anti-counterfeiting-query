import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { 
  Button,
  Form,
  Field,
  Toast,
  ConfigProvider,
  Uploader,
  Dialog,
  Icon,
  RadioGroup,
  Radio,
  NavBar,
  List,
  PullRefresh,
  Image as VanImage,
  Tabbar,
  TabbarItem,
  ActionSheet
} from 'vant'
import 'vant/lib/index.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// 注册Vant组件
app.use(Button)
app.use(Form)
app.use(Field)
app.use(Toast)
app.use(ConfigProvider)
app.use(Uploader)
app.use(Dialog)
app.use(Icon)
app.use(RadioGroup)
app.use(Radio)
app.use(NavBar)
app.use(List)
app.use(PullRefresh)
app.use(VanImage)
app.use(Tabbar)
app.use(TabbarItem)
app.use(ActionSheet)

app.use(createPinia())
app.use(router)

app.mount('#app')
