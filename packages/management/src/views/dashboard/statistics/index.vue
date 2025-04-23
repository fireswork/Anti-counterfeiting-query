<template>
  <div class="statistics-dashboard">
    <div class="dashboard-content">
      <!-- 高亮卡片区域 -->
      <div class="highlight-cards">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="6">
            <a-card 
              class="highlight-card" 
              :class="{ active: dataFilter === 'product' }"
              @click="handleDataFilterChange('product')"
            >
              <div class="card-content">
                <div class="card-title">商品总数</div>
                <div class="card-value">{{ statistics.productTypeCount || 0 }}</div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-card 
              class="highlight-card" 
              :class="{ active: dataFilter === 'user' }"
              @click="handleDataFilterChange('user')"
            >
              <div class="card-content">
                <div class="card-title">客户总数</div>
                <div class="card-value">{{ statistics.userCount || 0 }}</div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-card 
              class="highlight-card" 
              :class="{ active: dataFilter === 'tag' }"
              @click="handleDataFilterChange('tag')"
            >
              <div class="card-content">
                <div class="card-title">标签总数</div>
                <div class="card-value">{{ statistics.boundTagCount || 0 }}</div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-card 
              class="highlight-card" 
              :class="{ active: dataFilter === 'tagLog' }"
              @click="handleDataFilterChange('tagLog')"
            >
              <div class="card-content">
                <div class="card-title">查询总数</div>
                <div class="card-value">{{ statistics.tagLogCount || 0 }}</div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
      
      <!-- 柱状图区域 -->
      <div class="chart-section">
        <a-row :gutter="[16, 16]">
          <a-col :span="24">
            <a-card>
              <!-- 时间维度筛选 -->
              <div class="chart-filter">
                <div class="date-filter">
                  <span style="margin-right: 8px">当前维度: {{ getDataTypeLabel(dataFilter) }}</span>
                  <a-radio-group v-model:value="timeFilter" button-style="solid" @change="handleTimeFilterChange">
                    <a-radio-button value="day">日</a-radio-button>
                    <a-radio-button value="week">周</a-radio-button>
                    <a-radio-button value="month">月</a-radio-button>
                    <a-radio-button value="year">年</a-radio-button>
                  </a-radio-group>
                </div>
              </div>
              <div class="chart-container">
                <v-chart class="chart" :option="barChartOption" />
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
      
      <!-- 右侧面板 - 两个指标区域 -->
      <div class="right-panel">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :md="24">
            <a-card>
              <div class="indicator-panel">
                <div class="panel-title">
                  {{ getPanelTitle() }}
                </div>
                <div v-if="dataFilter === 'product'" class="indicators-wrapper">
                  <div class="indicator-item" v-for="(item, index) in productTypeStats" :key="index">
                    <div class="indicator-color" :style="{ backgroundColor: getColorByIndex(index) }"></div>
                    <div class="indicator-label">{{ item.name }}</div>
                    <div class="indicator-value">{{ item.value }}</div>
                  </div>
                </div>
                <div v-else-if="dataFilter === 'tag'" class="indicators-wrapper">
                  <div class="indicator-summary">
                    <p>标签总量: {{ formatNumber(statistics.boundTagCount) }}</p>
                    <p>已验证标签: {{ formatNumber(statistics.verifiedTagCount || 0) }}</p>
                    <p>验证成功率: {{ statistics.successRate || '0%' }}</p>
                  </div>
                </div>
                <div v-else-if="dataFilter === 'user'" class="indicators-wrapper">
                  <div class="indicator-summary">
                    <p>用户总量: {{ formatNumber(statistics.userCount) }}</p>
                    <p>活跃用户: {{ formatNumber(statistics.activeUserCount || 0) }}</p>
                    <p>平均每日新增: {{ formatNumber(statistics.avgDailyNewUsers || 0) }}</p>
                  </div>
                </div>
                <div v-else-if="dataFilter === 'tagLog'" class="indicators-wrapper">
                  <div class="indicator-summary">
                    <p>查询总次数: {{ formatNumber(statistics.tagLogCount) }}</p>
                    <p>当日查询次数: {{ formatNumber(statistics.todayTagLogCount || 0) }}</p>
                    <p>日均查询次数: {{ formatNumber(statistics.avgDailyTagLogCount || 0) }}</p>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { message } from 'ant-design-vue'
import request from '@/api/request'

// 注册必须的组件
use([
  CanvasRenderer,
  BarChart,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 色彩数组
const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']

// 根据索引获取颜色
const getColorByIndex = (index) => {
  return colors[index % colors.length]
}

// 柱状图配置
const barChartOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: []
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: []
})

// 时间筛选状态
const timeFilter = ref('year')

// 数据维度筛选状态
const dataFilter = ref('product')

// 获取数据类型显示名称
const getDataTypeLabel = (type) => {
  const typeMap = {
    'tag': '标签数据',
    'user': '用户数据',
    'product': '商品数据',
    'tagLog': '标签日志'
  }
  return typeMap[type] || '标签数据'
}

// 统计数据
const statistics = ref({
  productTypeCount: 0,
  userCount: 0,
  boundTagCount: 0,
  tagLogCount: 0
})

// 产品类型分布统计
const productTypeStats = ref([])

// 时间维度统计数据
const timeStatisticsData = ref({
  data: {},
  dates: [],
  productTypes: [],
  counts: []
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await request.get('/system/report/statistics')
    if (res.code === 200) {
      statistics.value = res.data || {}
    } else {
      message.error('获取统计数据失败')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    message.error('获取统计数据失败')
  }
}

// 数据维度过滤器变更
const handleDataFilterChange = (dataType) => {
  // 先完全重置图表配置
  barChartOption.value = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: []
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: []
  }
  
  // 然后更新数据筛选器并加载数据
  dataFilter.value = dataType
  loadTimeStatistics(timeFilter.value, dataType)
}

// 时间维度过滤器变更
const handleTimeFilterChange = () => {
  loadTimeStatistics(timeFilter.value, dataFilter.value)
}

// 加载时间维度统计数据
const loadTimeStatistics = async (timeType, dataType = 'tag') => {
  try {
    // 先重置图表，避免残留旧数据
    barChartOption.value = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: []
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: []
    }
    
    const res = await request.get('/system/report/timeStatistics', { 
      params: { 
        timeType,
        dataType
      } 
    })
    
    if (res.code === 200) {
      // 保存原始数据
      if (!res.data || Object.keys(res.data).length === 0) {
        // 处理空数据的情况
        timeStatisticsData.value = { 
          data: {}, 
          dates: [], 
          productTypes: [],
          counts: [] 
        }
        // 清空产品类型统计
        productTypeStats.value = []
      } else {
        // 有数据的情况
        timeStatisticsData.value = res.data
        
        // 更新图表数据
        updateChartWithApiData(timeStatisticsData.value, dataType)
        
        // 如果是商品数据类型，更新产品类型统计
        if (dataType === 'product') {
          updateProductTypeStats(timeStatisticsData.value)
        }
      }
    } else {
      message.error('获取时间维度统计失败')
      // 清空数据和图表
      timeStatisticsData.value = { 
        data: {}, 
        dates: [], 
        productTypes: [],
        counts: [] 
      }
      productTypeStats.value = []
    }
  } catch (error) {
    console.error('获取时间维度统计失败:', error)
    message.error('获取时间维度统计失败')
    // 清空数据和图表
    timeStatisticsData.value = { 
      data: {}, 
      dates: [], 
      productTypes: [],
      counts: [] 
    }
    productTypeStats.value = []
  }
}

// 格式化数字显示
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取面板标题
const getPanelTitle = () => {
  switch (dataFilter.value) {
    case 'product': return '商品类型分布'
    case 'tag': return '标签统计数据'
    case 'user': return '用户统计数据'
    case 'tagLog': return '查询记录统计'
    default: return '数据统计'
  }
}

// 修改使用API数据更新图表的函数，添加无数据处理
const updateChartWithApiData = (data, dataType) => {
  // 检查数据是否为空或者不完整
  if (!data || !data.dates || data.dates.length === 0) {
    return
  }
  
  // 设置X轴日期数据
  barChartOption.value.xAxis.data = data.dates || []
  
  // 根据不同的数据类型更新图表
  if (dataType === 'product') {
    // 检查产品类型数据是否存在
    if (!data.productTypes || data.productTypes.length === 0 || !data.data) {
      return
    }
    
    // 商品类型有多个系列 - 先清空legend和series
    barChartOption.value.legend.data = []
    barChartOption.value.series = []
    
    // 重新设置legend数据
    barChartOption.value.legend.data = data.productTypes || []
    
    // 为每个产品类型创建一个系列
    let hasData = false
    data.productTypes.forEach((type, index) => {
      const seriesData = data.data[type] || []
      
      // 检查是否有实际数据
      if (seriesData.some(val => val > 0)) {
        hasData = true
      }
      
      barChartOption.value.series.push({
        name: type,
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: getColorByIndex(index)
        }
      })
    })
    
    // 如果所有系列都没有数据，清空图表
    if (!hasData) {
      barChartOption.value.series = []
    }
  } else {
    // 检查常规类型数据是否存在
    if (!data.counts || data.counts.length === 0) {
      return
    }
    
    // 其他类型只有一个系列 - 先清空legend和series
    barChartOption.value.legend.data = []
    barChartOption.value.series = []
    
    // 检查是否有实际数据
    const hasData = data.counts.some(val => val > 0)
    
    if (hasData) {
      // 重新设置legend数据
      barChartOption.value.legend.data = [getDataTypeLabel(dataType)]
      
      barChartOption.value.series = [{
        name: getDataTypeLabel(dataType),
        type: 'bar',
        data: data.counts,
        itemStyle: {
          color: colors[0]
        }
      }]
    }
  }
}

// 更新产品类型统计
const updateProductTypeStats = (data) => {
  if (!data || !data.data) {
    productTypeStats.value = []
    return
  }
  
  // 计算每个产品类型的总和
  const typeTotals = {}
  let grandTotal = 0
  
  if (data.productTypes) {
    data.productTypes.forEach(type => {
      const values = data.data[type] || []
      const total = values.reduce((sum, value) => sum + value, 0)
      typeTotals[type] = total
      grandTotal += total
    })
    
    // 转换为百分比并创建数组
    productTypeStats.value = data.productTypes.map(type => {
      const total = typeTotals[type] || 0
      const percentage = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : 0
      
      return {
        name: type,
        value: `${percentage}%`
      }
    })
  } else {
    productTypeStats.value = []
  }
}

onMounted(async () => {
  // 加载统计数据
  await loadStatistics()
  
  // 加载时间维度数据
  handleTimeFilterChange()
})
</script>

<style scoped lang="less">
.statistics-dashboard {
  height: 100%;
  
  .dashboard-content {
    padding: 20px;
    background-color: #f0f2f5;
    
    .highlight-cards {
      margin-bottom: 20px;
      
      .highlight-card {
        height: 140px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-3px);
        }
        
        &.active {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
        
        .card-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          
          .card-title {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.45);
          }
          
          .card-value {
            font-size: 30px;
            font-weight: 600;
            margin: 8px 0;
          }
          
          .card-subtitle {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.65);
          }
        }
      }
    }
    
    .chart-section {
      margin-bottom: 20px;
      
      .chart-filter {
        margin-bottom: 16px;
        
        .date-filter {
          display: flex;
          gap: 16px;
          align-items: center;
          
          .ant-radio-group {
            margin-right: 12px;
          }
          
          .ant-picker {
            width: 250px;
          }
        }
      }
      
      .chart-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 10px;
      }
      
      .chart-description {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.65);
        margin-bottom: 20px;
      }
      
      .chart-container {
        height: 400px;
        
        .chart {
          height: 100%;
          width: 100%;
        }
      }
    }
    
    .right-panel {
      margin-bottom: 20px;
      
      .display-panel, .indicator-panel {
        height: 200px;
        
        .panel-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 16px;
        }
        
        .detail-display {
          display: flex;
          justify-content: center;
          align-items: center;
          height: calc(100% - 40px);
          background-color: #f9f9f9;
          border-radius: 4px;
          overflow: auto;
          
          .detail-content {
            width: 100%;
            padding: 0 10px;
            margin-top: 80px;
          }
        }
        
        .indicators-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
          
          .indicator-item {
            display: flex;
            align-items: center;
            
            .indicator-color {
              width: 16px;
              height: 16px;
              border-radius: 4px;
              background-color: #1890ff;
              margin-right: 8px;
            }
            
            .indicator-value {
              margin-left: auto;
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}
</style> 