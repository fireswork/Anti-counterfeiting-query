<template>
  <div class="statistics-dashboard">
    <div class="dashboard-content">
      <!-- 高亮卡片区域 -->
      <div class="highlight-cards">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="6">
            <a-card class="highlight-card" :class="{ active: activeCard === 'products' }" @click="selectCard('products')">
              <div class="card-content">
                <div class="card-title">商品种类</div>
                <div class="card-value">354</div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-card class="highlight-card" :class="{ active: activeCard === 'customers' }" @click="selectCard('customers')">
              <div class="card-content">
                <div class="card-title">客户总数</div>
                <div class="card-value">85</div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-card class="highlight-card" :class="{ active: activeCard === 'shipments' }" @click="selectCard('shipments')">
              <div class="card-content">
                <div class="card-title">出货标签总数</div>
                <div class="card-value">1268</div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-card class="highlight-card" :class="{ active: activeCard === 'tags' }" @click="selectCard('tags')">
              <div class="card-content">
                <div class="card-title">查询标签总数</div>
                <div class="card-value">4213</div>
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
              <!-- 将日期筛选移到这里 -->
              <div class="chart-filter">
                <div class="date-filter">
                  <a-radio-group v-model:value="timeFilter" button-style="solid">
                    <a-radio-button value="day">日</a-radio-button>
                    <a-radio-button value="week">周</a-radio-button>
                    <a-radio-button value="month">月</a-radio-button>
                    <a-radio-button value="year">年</a-radio-button>
                  </a-radio-group>
                  <a-range-picker v-model:value="dateRange" :disabled="timeFilter !== 'custom'" />
                  <a-button type="primary" @click="handleFilterData">查询</a-button>
                  <a-button @click="resetFilter">重置</a-button>
                </div>
              </div>
              
              <div class="chart-title">
                柱状图 点击上面四个框下方按钮显示对应类型的数据
              </div>
              <div class="chart-description">
                柱状图 点击上面单个框显示对应种类的标签对应数量 以及分类 蓝色预留品类的比率 以及分类数量和增长率
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
          <a-col :xs="24" :md="12">
            <a-card>
              <div class="display-panel">
                <div class="panel-title">
                  {{ detailsTitle }}
                </div>
                <div class="detail-display">
                  <div class="detail-content">
                    <a-descriptions :column="1" bordered>
                      <a-descriptions-item v-for="(detail, index) in cardDetails" :key="index" :label="detail.label">
                        {{ detail.value }}
                      </a-descriptions-item>
                    </a-descriptions>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-card>
              <div class="indicator-panel">
                <div class="panel-title">
                  标签指标分布
                </div>
                <div class="indicators-wrapper">
                  <div class="indicator-item" v-for="indicator in indicators" :key="indicator.id">
                    <div class="indicator-color" :style="{ backgroundColor: indicator.color }"></div>
                    <div class="indicator-label">{{ indicator.name }}</div>
                    <div class="indicator-value">{{ indicator.value }}</div>
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
import { ref, onMounted } from 'vue'
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

// 柱状图配置
const barChartOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['商品种类', '客户数量', '出货量']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '商品种类',
      type: 'bar',
      data: [120, 200, 150]
    },
    {
      name: '客户数量',
      type: 'bar',
      data: [80, 150, 160]
    },
    {
      name: '出货量',
      type: 'bar',
      data: [180, 220, 250]
    }
  ]
})

// 时间筛选状态
const timeFilter = ref('month')
const dateRange = ref(null)

// 卡片交互状态
const activeCard = ref('products')
const detailsTitle = ref('商品种类详细信息')
const cardDetails = ref([])
const indicators = ref([])

// 选择卡片
const selectCard = (cardType) => {
  activeCard.value = cardType
  
  // 更新详细信息
  switch (cardType) {
    case 'products':
      detailsTitle.value = '商品种类详细信息'
      cardDetails.value = [
        { label: '商品种类数', value: '354' },
        { label: '已绑定标签', value: '3215个' },
        { label: '高频验证商品', value: '42种' },
        { label: '商品增长率', value: '12.3%' }
      ]
      updateChartForCard('products')
      break
    case 'customers':
      detailsTitle.value = '客户总数详细信息'
      cardDetails.value = [
        { label: '客户总数', value: '85' },
        { label: '活跃客户', value: '65 (76.5%)' },
        { label: '平均产品绑定数', value: '35.6个' },
        { label: '客户产品数量', value: '根据每个客户的商品数量显示' }
      ]
      updateChartForCard('customers')
      break
    case 'shipments':
      detailsTitle.value = '出货标签详细信息'
      cardDetails.value = [
        { label: '出货标签数', value: '1,268' },
        { label: '上月出货标签', value: '235个' },
        { label: '标签增长率', value: '4.2%' },
        { label: '已入库和出库的数量', value: '入库: 890, 出库: 378' }
      ]
      updateChartForCard('shipments')
      break
    case 'tags':
      detailsTitle.value = '标签总数详细信息'
      cardDetails.value = [
        { label: '标签总数', value: '4,213' },
        { label: '已使用标签', value: '3,845 (91.2%)' },
        { label: '本月所有标签总数', value: '245' },
        { label: '目前所有在库量', value: '368个' }
      ]
      updateChartForCard('tags')
      break
  }
  
  // 更新指标数据
  updateIndicators(cardType)
}

// 根据选中的卡片更新图表
const updateChartForCard = (cardType) => {
  // 在实际项目中，应该根据不同的卡片类型调用API获取相应的数据
  // 这里仅作为示例，使用模拟数据
  switch (cardType) {
    case 'products':
      barChartOption.value.legend.data = ['服装类', '电子类', '食品类']
      barChartOption.value.series[0].name = '服装类'
      barChartOption.value.series[1].name = '电子类'
      barChartOption.value.series[2].name = '食品类'
      break
    case 'customers':
      barChartOption.value.legend.data = ['新客户', '活跃客户', '流失客户']
      barChartOption.value.series[0].name = '新客户'
      barChartOption.value.series[1].name = '活跃客户'
      barChartOption.value.series[2].name = '流失客户'
      break
    case 'shipments':
      barChartOption.value.legend.data = ['国内出货', '国外出货', '其他渠道']
      barChartOption.value.series[0].name = '国内出货'
      barChartOption.value.series[1].name = '国外出货'
      barChartOption.value.series[2].name = '其他渠道'
      break
    case 'tags':
      barChartOption.value.legend.data = ['已使用', '库存中', '已损坏']
      barChartOption.value.series[0].name = '已使用'
      barChartOption.value.series[1].name = '库存中'
      barChartOption.value.series[2].name = '已损坏'
      break
  }
  
  // 更新数据，保持当前的时间维度
  updateChartData(timeFilter.value, cardType)
}

// 更新指标数据
const updateIndicators = (cardType) => {
  switch (cardType) {
    case 'products':
      indicators.value = [
        { id: 1, name: '服装类商品', value: '42%', color: '#1890ff' },
        { id: 2, name: '电子类商品', value: '35%', color: '#52c41a' },
        { id: 3, name: '其他品类商品', value: '23%', color: '#faad14' }
      ]
      break
    case 'customers':
      indicators.value = [
        { id: 1, name: '批发客户', value: '45%', color: '#1890ff' },
        { id: 2, name: '零售客户', value: '38%', color: '#52c41a' },
        { id: 3, name: '个人客户', value: '17%', color: '#faad14' }
      ]
      break
    case 'shipments':
      indicators.value = [
        { id: 1, name: '本月出货标签', value: '38%', color: '#1890ff' },
        { id: 2, name: '上月出货标签', value: '42%', color: '#52c41a' },
        { id: 3, name: '去年同期', value: '20%', color: '#faad14' }
      ]
      break
    case 'tags':
      indicators.value = [
        { id: 1, name: '当前库存标签', value: '45%', color: '#1890ff' },
        { id: 2, name: '已出货标签', value: '35%', color: '#52c41a' },
        { id: 3, name: '日 周 月查询量', value: '20%', color: '#faad14' }
      ]
      break
  }
}

// 处理数据筛选
const handleFilterData = () => {
  console.log('Filtering data with:', timeFilter.value, dateRange.value)
  // 实际项目中这里应该调用API获取不同时间维度的数据
  updateChartData(timeFilter.value, activeCard.value)
}

// 重置筛选条件
const resetFilter = () => {
  timeFilter.value = 'month'
  dateRange.value = null
  updateChartData('month', activeCard.value)
}

// 根据时间维度更新图表数据
const updateChartData = (timeType, cardType = activeCard.value) => {
  // 基本数据模板
  let baseData = {}
  
  // 根据卡片类型和时间维度生成不同的数据
  switch (cardType) {
    case 'products':
      baseData = {
        day: {
          xAxis: ['上午', '中午', '下午', '晚上'],
          series: [
            [15, 25, 20, 18],
            [20, 30, 25, 15],
            [10, 15, 20, 12]
          ]
        },
        week: {
          xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          series: [
            [28, 32, 36, 34, 38, 30, 25],
            [25, 30, 35, 38, 40, 35, 30],
            [18, 22, 26, 24, 28, 20, 15]
          ]
        },
        month: {
          xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
          series: [
            [120, 132, 141, 154, 162, 150],
            [85, 90, 95, 100, 110, 105],
            [45, 52, 58, 62, 68, 65]
          ]
        },
        year: {
          xAxis: ['第一季度', '第二季度', '第三季度', '第四季度'],
          series: [
            [320, 350, 380, 360],
            [280, 300, 320, 310],
            [150, 180, 200, 190]
          ]
        }
      }
      break
      
    case 'customers':
      baseData = {
        day: {
          xAxis: ['上午', '中午', '下午', '晚上'],
          series: [
            [8, 15, 12, 10],
            [25, 35, 30, 28],
            [5, 8, 10, 12]
          ]
        },
        week: {
          xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          series: [
            [10, 12, 15, 13, 16, 8, 5],
            [35, 40, 45, 48, 50, 38, 30],
            [8, 12, 15, 17, 14, 10, 9]
          ]
        },
        month: {
          xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
          series: [
            [18, 21, 24, 27, 30, 28],
            [50, 58, 62, 65, 70, 68],
            [12, 15, 18, 20, 17, 16]
          ]
        },
        year: {
          xAxis: ['第一季度', '第二季度', '第三季度', '第四季度'],
          series: [
            [65, 75, 85, 80],
            [180, 200, 220, 210],
            [45, 55, 60, 58]
          ]
        }
      }
      break
      
    case 'shipments':
      baseData = {
        day: {
          xAxis: ['上午', '中午', '下午', '晚上'],
          series: [
            [35, 50, 45, 40],
            [25, 35, 30, 25],
            [15, 20, 18, 16]
          ]
        },
        week: {
          xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          series: [
            [80, 95, 110, 105, 120, 70, 50],
            [60, 75, 85, 90, 95, 55, 40],
            [30, 35, 40, 38, 42, 25, 20]
          ]
        },
        month: {
          xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
          series: [
            [180, 210, 240, 260, 290, 275],
            [150, 170, 190, 205, 225, 210],
            [80, 95, 110, 120, 135, 125]
          ]
        },
        year: {
          xAxis: ['第一季度', '第二季度', '第三季度', '第四季度'],
          series: [
            [650, 720, 780, 720],
            [520, 580, 620, 590],
            [280, 310, 340, 320]
          ]
        }
      }
      break
      
    case 'tags':
      baseData = {
        day: {
          xAxis: ['上午', '中午', '下午', '晚上'],
          series: [
            [80, 120, 100, 90],
            [60, 80, 75, 70],
            [20, 25, 22, 18]
          ]
        },
        week: {
          xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          series: [
            [150, 180, 200, 190, 210, 120, 90],
            [110, 130, 145, 150, 165, 90, 70],
            [35, 45, 50, 48, 52, 25, 18]
          ]
        },
        month: {
          xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
          series: [
            [350, 380, 420, 450, 490, 470],
            [250, 280, 310, 330, 360, 340],
            [80, 90, 105, 115, 125, 120]
          ]
        },
        year: {
          xAxis: ['第一季度', '第二季度', '第三季度', '第四季度'],
          series: [
            [1150, 1280, 1380, 1320],
            [850, 940, 1020, 980],
            [280, 320, 350, 330]
          ]
        }
      }
      break
  }
  
  // 更新图表数据
  if (baseData[timeType]) {
    barChartOption.value.xAxis.data = baseData[timeType].xAxis
    barChartOption.value.series[0].data = baseData[timeType].series[0]
    barChartOption.value.series[1].data = baseData[timeType].series[1]
    barChartOption.value.series[2].data = baseData[timeType].series[2]
  }
}

onMounted(() => {
  // 初始加载
  selectCard('products')
  updateChartData('month', 'products')
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