import axios from 'axios'
import * as echarts from 'echarts'

// 加载中国地图数据
export const loadChineseMap = async () => {
  try {
    // 检查地图是否已经注册
    if (!echarts.getMap('china')) {
      // 使用DataV的GeoJSON数据
      const { data } = await axios.get('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      echarts.registerMap('china', data)
    }
    return true
  } catch (error) {
    console.error('加载地图数据失败:', error)
    return false
  }
} 