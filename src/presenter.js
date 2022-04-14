import parse from 'date-fns/parse';
import format from 'date-fns/format';
import enGB from 'date-fns/locale/en-GB';

export default class Presenter {

    static dateFormat = "yyyy-MM-dd'T'HH:mm:ss";

    #view;

    // timestamp
    #timestampData;

    // CPU
    #usData;
    #syData;
    #idData;
    #waData;
    #stData;

    // Memory
    #swpdData;
    #freeData;
    #inactData;
    #activeData;

    // Procs
    #rData;
    #bData;

    // IOs
    #biData;
    #boData;

    // System
    #inData;
    #csData;

    // Swap
    #siData;
    #soData;

    #selectedStartTime;
    #selectedEndTime;

    onFileSelect(file) {
        const self = this;
        file.text().then(txt => self._processLog(txt));
    }

    onStartTimeChange(time) {
        this.#selectedStartTime = parse(time, Presenter.dateFormat, new Date(), { locale: enGB }).getTime()
        this._updateChartDataRange();
    }

    onEndTimeChange(time) {
        this.#selectedEndTime = parse(time, Presenter.dateFormat, new Date(), { locale: enGB }).getTime()
        this._updateChartDataRange();
    }

    onRangeReset() {
        this.#selectedStartTime = this.#timestampData[0];
        this.#selectedEndTime = this.#timestampData[this.#timestampData.length - 1];
        this.#view.setStartTime(format(this.#timestampData[0], Presenter.dateFormat, { locale: enGB }));
        this.#view.setEndTime(format(this.#timestampData[this.#timestampData.length - 1], Presenter.dateFormat, { locale: enGB }));
        this.#view.hideVError();
        this._updateChartDataRange();
    }

    setView(view) {
        this.#view = view;
    }

    _updateChartDataRange() {
        if (this.#selectedStartTime && this.#selectedEndTime && this.#selectedEndTime < this.#selectedStartTime) {
            this.#view.showVError();
            return;
        }

        this.#view.hideVError();

        const start = this._findTimestampBoundIndex(this.#selectedStartTime, true);
        const end = this._findTimestampBoundIndex(this.#selectedEndTime, false) + 1;

        const timestampDataSliced = this.#timestampData.slice(start, end);

        this.#view.updateCpuChart(timestampDataSliced, this.#usData.slice(start, end), this.#syData.slice(start, end), 
            this.#idData.slice(start, end), this.#waData.slice(start, end), this.#stData.slice(start, end));
        this.#view.updateMemChart(timestampDataSliced, this.#swpdData.slice(start, end), this.#freeData.slice(start, end), 
            this.#inactData.slice(start, end), this.#activeData.slice(start, end));
        this.#view.updateProcsChart(timestampDataSliced, this.#rData.slice(start, end), this.#bData.slice(start, end));
        this.#view.updateIOChart(timestampDataSliced, this.#biData.slice(start, end), this.#boData.slice(start, end));
        this.#view.updateSystemChart(timestampDataSliced, this.#inData.slice(start, end), this.#csData.slice(start, end));
        this.#view.updateSwapChart(timestampDataSliced, this.#siData.slice(start, end), this.#soData.slice(start, end));
    }

    _findTimestampBoundIndex(time, isLeft) {
        if (this.#timestampData.length === 1) {
            return 0;
        }

        let left = 0;
        let right = this.#timestampData.length - 1;

        while (left + 1 < right) {
            let mid = left + Math.floor((right - left) / 2);
            if (this.#timestampData[mid] === time) {
                return mid;
            } else if (this.#timestampData[mid] < time) {
                left = isLeft ? mid + 1 : mid;
            } else {
                right = isLeft ? mid : mid - 1;
            }
        }

        return isLeft ? left : right;
    }

    * _createLineReader(txt) {
        let buffer = [];
        for (let i = 0; i < txt.length; i++) {
            const char = txt.charAt(i);
            if (char === '\n' || char == '\r') {
                if (buffer.length === 0) {
                    continue;
                }
                yield buffer.join('');
                buffer = [];
            } else {
                buffer.push(char);
            }
        }
        return null;
    }
    
    _processLog(txt) {
        // timestamp
        this.#timestampData = [];

        // CPU
        this.#usData = [];
        this.#syData = [];
        this.#idData = [];
        this.#waData = [];
        this.#stData = [];

        // Memory
        this.#swpdData = [];
        this.#freeData = [];
        this.#inactData = [];
        this.#activeData = [];

        // Procs
        this.#rData = [];
        this.#bData = [];

        // IOs
        this.#biData = [];
        this.#boData = [];

        // System
        this.#inData = [];
        this.#csData = [];

        // Swap
        this.#siData = [];
        this.#soData = [];
    
        const lineReader = this._createLineReader(txt);
        let line = lineReader.next();
        while (!line.done) {
            try {
                const splitted = line.value.trim().split(/\s+/);
                if (splitted.length < 19) {
                    line = lineReader.next();
                    continue;
                }
        
                // timestamp
                this.#timestampData.push(parse(splitted[17] + ' ' + splitted[18], 'yyyy-MM-dd HH:mm:ss', new Date(), { locale: enGB }).getTime());

                // CPU
                this.#usData.push(parseInt(splitted[12]));
                this.#syData.push(parseInt(splitted[13]));
                this.#idData.push(parseInt(splitted[14]));
                this.#waData.push(parseInt(splitted[15]));
                this.#stData.push(parseInt(splitted[16]));

                // Memory
                this.#swpdData.push(parseInt(splitted[2]));
                this.#freeData.push(parseInt(splitted[3]));
                this.#inactData.push(parseInt(splitted[4]));
                this.#activeData.push(parseInt(splitted[5]));

                // Procs
                this.#rData.push(parseInt(splitted[0]));
                this.#bData.push(parseInt(splitted[1]));

                // IOs
                this.#biData.push(parseInt(splitted[8]));
                this.#boData.push(parseInt(splitted[9]));

                // System
                this.#inData.push(parseInt(splitted[10]));
                this.#csData.push(parseInt(splitted[11]));

                // Swap
                this.#siData.push(parseInt(splitted[6]));
                this.#soData.push(parseInt(splitted[7]));
            } catch (e) {
                console.log(e);
            }
    
            line = lineReader.next();
        }

        if (this.#soData.length === 0) {
            this.#view.updateCpuChart([], [], [], [], [], []);
            this.#view.updateMemChart([], [], [], [], []);
            this.#view.updateProcsChart([], [], []);
            this.#view.updateIOChart([], [], []);
            this.#view.updateSystemChart([], [], []);
            this.#view.updateSwapChart([], [], []);
            this.#view.disableRangeInput();
            this.#view.showAlert("Failed to parse log file.");
            return;
        }
    
        this.#selectedStartTime = this.#timestampData[0];
        this.#selectedEndTime = this.#timestampData[this.#timestampData.length - 1];
        this.#view.setStartTime(format(this.#timestampData[0], Presenter.dateFormat, { locale: enGB }));
        this.#view.setEndTime(format(this.#timestampData[this.#timestampData.length - 1], Presenter.dateFormat, { locale: enGB }));
        this.#view.enableRangeInput();
        this._updateChartDataRange();
    }

}