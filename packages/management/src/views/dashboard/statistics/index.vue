<template>
  <div class="statistics-dashboard">
    <div class="dashboard-content">
      <!-- 高亮卡片区域 -->
      <div class="highlight-cards">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="6">
            <a-card class="highlight-card">
              <div class="card-content">
                <div class="card-title">商品种类</div>
                <div class="card-value">{{ statistics.productTypeCount || 0 }}</div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-card class="highlight-card">
              <div class="card-content">
                <div class="card-title">客户总数</div>
                <div class="card-value">{{ statistics.userCount || 0 }}</div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-card class="highlight-card">
              <div class="card-content">
                <div class="card-title">出货标签总数</div>
                <div class="card-value">{{ statistics.boundTagCount || 0 }}</div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-card class="highlight-card">
              <div class="card-content">
                <div class="card-title">查询标签总数</div>
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
          <!-- <a-col :xs="24" :md="12">
            <a-card>
              <div class="display-panel">
                <div class="panel-title">
                  数据趋势分析
                </div>
                <div class="detail-display">
                  <div class="detail-content">
                    <p>该图表显示了各商品类型在不同时间维度下的数据趋势。</p>
                    <p>您可以通过切换时间维度（日/周/月/年）来查看不同周期的数据分布。</p>
                    <p>数据来源于系统实时统计，可帮助您分析业务趋势和做出决策。</p>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col> -->
          <a-col :xs="24" :md="24">
            <a-card>
              <div class="indicator-panel">
                <div class="panel-title">
                  商品类型分布
                </div>
                <div class="indicators-wrapper">
                  <div class="indicator-item" v-for="(item, index) in productTypeStats" :key="index">
                    <div class="indicator-color" :style="{ backgroundColor: getColorByIndex(index) }"></div>
                    <div class="indicator-label">{{ item.name }}</div>
                    <div class="indicator-value">{{ item.value }}</div>
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
const timeFilter = ref('day')

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
  productTypes: []
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

// 时间维度过滤器变更
const handleTimeFilterChange = () => {
  loadTimeStatistics(timeFilter.value)
}

// 加载时间维度统计数据
const loadTimeStatistics = async (timeType) => {
  try {
    const res = await request.get('/system/report/timeStatistics', { params: { timeType } })
    
    if (res.code === 200) {
      // 保存原始数据
      timeStatisticsData.value = res.data || { data: {}, dates: [], productTypes: [] }
      
      // 更新图表数据
      updateChartWithApiData(timeStatisticsData.value)
      
      // 更新产品类型统计
      updateProductTypeStats(timeStatisticsData.value)
    } else {
      message.error('获取时间维度统计失败')
    }
  } catch (error) {
    console.error('获取时间维度统计失败:', error)
    message.error('获取时间维度统计失败')
  }
}

// 使用API数据更新图表
const updateChartWithApiData = (data) => {
  if (!data || !data.data) return
  
  // 设置X轴日期数据
  barChartOption.value.xAxis.data = data.dates || []
  
  // 设置图例数据
  barChartOption.value.legend.data = data.productTypes || []
  
  // 清空并重建系列数据
  barChartOption.value.series = []
  
  // 为每个产品类型创建一个系列
  if (data.productTypes && data.productTypes.length > 0) {
    data.productTypes.forEach((type, index) => {
      const seriesData = data.data[type] || []
      
      barChartOption.value.series.push({
        name: type,
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: getColorByIndex(index)
        }
      })
    })
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