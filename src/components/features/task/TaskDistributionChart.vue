<template>
  <div class="task-distribution-chart">
    <h3 class="task-distribution-chart__title">Розподіл завдань по статусах</h3>
    <div class="task-distribution-chart__canvas-wrap">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export interface TaskDistributionData {
  labels: string[]
  values: number[]
}

interface Props {
  chartData: TaskDistributionData
}

const props = defineProps<Props>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart<'bar'> | null = null

function buildChart() {
  if (!canvasRef.value || !props.chartData.labels.length) return
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: props.chartData.labels,
      datasets: [
        {
          label: 'Кількість завдань',
          data: props.chartData.values,
          backgroundColor: [
            'rgba(66, 184, 131, 0.7)',
            'rgba(101, 126, 234, 0.7)',
            'rgba(100, 116, 139, 0.7)',
          ],
          borderColor: ['rgb(66, 184, 131)', 'rgb(101, 126, 234)', 'rgb(100, 116, 139)'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Завдань: ${ctx.raw}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
      },
    },
  }
  chartInstance = new Chart(ctx, config)
}

watch(
  () => props.chartData,
  () => buildChart(),
  { deep: true }
)

onMounted(() => buildChart())

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped lang="scss">
.task-distribution-chart {
  padding: $spacing-lg;
  background-color: $color-bg-alt;
  border: 1px solid $color-border;
  border-radius: $radius-md;

  &__title {
    margin: 0 0 $spacing-md;
    font-size: $font-size-base;
    font-weight: 600;
    color: $color-text;
  }

  &__canvas-wrap {
    width: 100%;
    height: 240px;
  }
}
</style>
