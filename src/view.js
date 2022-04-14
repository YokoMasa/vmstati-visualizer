import {
    Chart,
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
    SubTitle
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {enGB} from 'date-fns/locale';

Chart.register(
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
    SubTitle
);

export default class View {

    static FIRST_COLOR = '#039be5';
    static SECOND_COLOR = '#3949ab';
    static THIRD_COLOR = '#43a047';
    static FOURTH_COLOR = '#e53935';
    static FIFTH_COLOR = '#fdd835';
    static SIXTH_COLOR = '#f4511e'

    #presenter;

    #cpuChart;
    #memChart;
    #procChart;
    #ioChart;
    #sysChart;
    #swapChart;

    #vErrorTime;
    #startTime;
    #endTime;
    #rangeResetButton;

    #chartData = {
        cpu_us: { label: 'User Time', data: [], borderColor: View.FIRST_COLOR },
        cpu_sy: { label: 'Kernel Time', data: [], borderColor: View.SECOND_COLOR },
        cpu_id: { label: 'Idle Time', data: [], borderColor: View.THIRD_COLOR },
        cpu_wa: { label: 'IO Time', data: [], borderColor: View.FOURTH_COLOR },
        cpu_st: { label: 'Stolen Time', data: [], borderColor: View.FIFTH_COLOR },
        mem_swpd: { label: 'Swap', data: [], borderColor: View.FIRST_COLOR },
        mem_free: { label: 'Free', data: [], borderColor: View.SECOND_COLOR },
        mem_inact: { label: 'Inactive', data: [], borderColor: View.THIRD_COLOR },
        mem_active: { label: 'Active', data: [], borderColor: View.FOURTH_COLOR },
        proc_r: { label: 'Runnable Processes', data: [], borderColor: View.FIRST_COLOR },
        proc_b: { label: 'Blocked Processes', data: [], borderColor: View.SECOND_COLOR },
        io_bi: { label: 'Blocks Received', data: [], borderColor: View.FIRST_COLOR },
        io_so: { label: 'Blocks Sent', data: [], borderColor: View.SECOND_COLOR },
        sys_in: { label: 'Number of Interrupts', data: [], borderColor: View.FIRST_COLOR },
        sys_cs: { label: 'Number of Context Switches', data: [], borderColor: View.SECOND_COLOR },
        swap_si: { label: 'Swap in', data: [], borderColor: View.FIRST_COLOR },
        swap_so: { label: 'Swap out', data: [], borderColor: View.SECOND_COLOR },
    };

    _onFileInput(e) {
        const files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }

        this.#presenter.onFileSelect(files[0]);
    }

    _onStartTimeChange(e) {
        this.#presenter.onStartTimeChange(e.target.value);
    }

    _onEndTimeChange(e) {
        this.#presenter.onEndTimeChange(e.target.value);
    }

    _onRangeReset(e) {
        this.#presenter.onRangeReset();
    }

    _onMaxMemoryChange(e) {
        this.#memChart.options.scales.y.suggestedMax = e.target.value;
        this.#memChart.update();
    }

    _getDefaultChartConfigObject() {
        return {
            type: 'line',
            data:  {
                labels: [],
                datasets: []
            },
            options: {
                responsive: false,
                animation: false,
                spanGaps: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'second'
                        },
                        adapters: {
                            date: {
                                locale: enGB
                            }
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
    }

    showAlert(message) {
        alert(message);
    }

    setStartTime(t) {
        this.#startTime.value = t;
    }

    setEndTime(t) {
        this.#endTime.value = t;
    }

    enableRangeInput() {
        this.#startTime.disabled = false;
        this.#endTime.disabled = false;
        this.#rangeResetButton.disabled = false;
    }

    disableRangeInput() {
        this.#startTime.disabled = true;
        this.#endTime.disabled = true;
        this.#rangeResetButton.disabled = true;
    }

    showVError() {
        this.#vErrorTime.style.display = 'block';
    }

    hideVError() {
        this.#vErrorTime.style.display = 'none';
    }

    updateCpuChart(dateData, usData, syData, idData, waData, stData) {
        this.#cpuChart.data.labels = dateData;
        this.#cpuChart.data.datasets[0].data = usData;
        this.#cpuChart.data.datasets[1].data = syData;
        this.#cpuChart.data.datasets[2].data = idData;
        this.#cpuChart.data.datasets[3].data = waData;
        this.#cpuChart.data.datasets[4].data = stData;
        this.#cpuChart.update();
    }

    updateMemChart(dateData, swpdData, freeData, inactData, activeData) {
        this.#memChart.data.labels = dateData;
        this.#memChart.data.datasets[0].data = swpdData;
        this.#memChart.data.datasets[1].data = freeData;
        this.#memChart.data.datasets[2].data = inactData;
        this.#memChart.data.datasets[3].data = activeData;
        this.#memChart.update();
    }

    updateProcsChart(dateData, rData, bData) {
        this.#procChart.data.labels = dateData;
        this.#procChart.data.datasets[0].data = rData;
        this.#procChart.data.datasets[1].data = bData;
        this.#procChart.update();
    }

    updateIOChart(dateData, biData, boData) {
        this.#ioChart.data.labels = dateData;
        this.#ioChart.data.datasets[0].data = biData;
        this.#ioChart.data.datasets[1].data = boData;
        this.#ioChart.update();
    }

    updateSystemChart(dateData, inData, csData) {
        this.#sysChart.data.labels = dateData;
        this.#sysChart.data.datasets[0].data = inData;
        this.#sysChart.data.datasets[1].data = csData;
        this.#sysChart.update();
    }

    updateSwapChart(dateData, siData, soData) {
        this.#swapChart.data.labels = dateData;
        this.#swapChart.data.datasets[0].data = siData;
        this.#swapChart.data.datasets[1].data = soData;
        this.#swapChart.update();
    }

    constructor(document, presenter) {
        this.#presenter = presenter;
        this.#presenter.setView(this);

        // init fileInput
        let fileInput = document.getElementById('logfile_input');
        const self = this;
        fileInput.addEventListener('input', e => self._onFileInput(e));

        // CPU
        let ctx = document.getElementById('chart_cpu');
        let chartObj = this._getDefaultChartConfigObject();
        chartObj.options.scales.y.max = 100;
        chartObj.data.datasets.push(this.#chartData.cpu_us);
        chartObj.data.datasets.push(this.#chartData.cpu_sy);
        chartObj.data.datasets.push(this.#chartData.cpu_id);
        chartObj.data.datasets.push(this.#chartData.cpu_wa);
        chartObj.data.datasets.push(this.#chartData.cpu_st);
        this.#cpuChart = new Chart(ctx, chartObj);

        // Memory
        ctx = document.getElementById('chart_memory');
        chartObj = this._getDefaultChartConfigObject();
        chartObj.data.datasets.push(this.#chartData.mem_swpd);
        chartObj.data.datasets.push(this.#chartData.mem_free);
        chartObj.data.datasets.push(this.#chartData.mem_inact);
        chartObj.data.datasets.push(this.#chartData.mem_active);
        this.#memChart = new Chart(ctx, chartObj);

         // Procs
         ctx = document.getElementById('chart_procs');
         chartObj = this._getDefaultChartConfigObject();
         chartObj.data.datasets.push(this.#chartData.proc_r);
         chartObj.data.datasets.push(this.#chartData.proc_b);
         this.#procChart = new Chart(ctx, chartObj);

         // IO
         ctx = document.getElementById('chart_io');
         chartObj = this._getDefaultChartConfigObject();
         chartObj.data.datasets.push(this.#chartData.io_bi);
         chartObj.data.datasets.push(this.#chartData.io_so);
         this.#ioChart = new Chart(ctx, chartObj);

         // System
         ctx = document.getElementById('chart_system');
         chartObj = this._getDefaultChartConfigObject();
         chartObj.data.datasets.push(this.#chartData.sys_in);
         chartObj.data.datasets.push(this.#chartData.sys_cs);
         this.#sysChart = new Chart(ctx, chartObj);

         // Swap
         ctx = document.getElementById('chart_swap');
         chartObj = this._getDefaultChartConfigObject();
         chartObj.data.datasets.push(this.#chartData.swap_si);
         chartObj.data.datasets.push(this.#chartData.swap_so);
         this.#swapChart = new Chart(ctx, chartObj);

         // Start time
         this.#startTime = document.getElementById('startTime');
         this.#startTime.addEventListener('change', e => this._onStartTimeChange(e));

         // End time
         this.#endTime = document.getElementById('endTime');
         this.#endTime.addEventListener('change', e => this._onEndTimeChange(e));

         // Range reset button
         this.#rangeResetButton = document.getElementById('rangeResetButton');
         this.#rangeResetButton.addEventListener('click', e => this._onRangeReset(e));

         // Time validation error
         this.#vErrorTime = document.getElementById('v-error-time');

         // Max memory
         let maxMemoryInput = document.getElementById('max_memory');
         maxMemoryInput.addEventListener('change', e => this._onMaxMemoryChange(e));

    }

}