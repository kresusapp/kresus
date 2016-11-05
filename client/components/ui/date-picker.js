import React from 'react';

import { maybeHas, translate as $t } from '../../helpers';

export default class DatePicker extends React.Component {

    constructor(props) {
        super(props);
        this.pickadate = null;
    }

    componentDidMount() {
        let pickerOptions = this.generateLocalizationObject();
        pickerOptions = this.setMaxOrMin(pickerOptions, this.props);
        let input = this.refs.elem;
        this.pickadate = $(input).pickadate(pickerOptions).pickadate('picker');
        this.pickadate.on('set', value => {
            if (maybeHas(value, 'clear') && this.props.onSelect) {
                this.props.onSelect(null);
            } else if (maybeHas(value, 'select')) {
                let actualDate = new Date(value.select);

                // pickadate returns UTC time, fix the timezone offset.
                actualDate.setMinutes(actualDate.getMinutes() - actualDate.getTimezoneOffset());

                if (this.props.onSelect)
                    this.props.onSelect(+actualDate);
            }
        });
    }

    componentWillUnmount() {
        if (this.pickadate)
            this.pickadate.stop();
    }

    setMaxOrMin(pickerOptions, props) {
        // Maybe a minimum or maximum value is set
        pickerOptions.max = props.maxDate ? new Date(props.maxDate) : false;
        pickerOptions.min = props.minDate ? new Date(props.minDate) : false;
        return pickerOptions;
    }

    componentWillReceiveProps(newProps) {
        let pickerOptions = this.setMaxOrMin({}, newProps);
        this.pickadate.set(pickerOptions);
    }

    localizationTable(prefix, tableToLocalize) {
        return tableToLocalize.map(element => $t(`client.datepicker.${prefix}.${element}`));
    }

    generateLocalizationObject() {
        let monthTable = [
            'january',
            'february',
            'march',
            'april',
            'may',
            'june',
            'july',
            'august',
            'september',
            'october',
            'november',
            'december'
        ];
        let weekdaysTable = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ];
        return {
            monthsFull: this.localizationTable('monthsFull', monthTable),
            monthsShort: this.localizationTable('monthsShort', monthTable),
            weekdaysFull: this.localizationTable('weekdaysFull', weekdaysTable),
            weekdaysShort: this.localizationTable('weekdaysShort', weekdaysTable),
            today: $t('client.datepicker.today'),
            clear: $t('client.datepicker.clear'),
            close: $t('client.datepicker.close'),
            firstDay: $t('client.datepicker.firstDay'),
            format: $t('client.datepicker.format'),
            formatSubmit: $t('client.datepicker.formatSubmit'),
            labelMonthNext: $t('client.datepicker.labelMonthNext'),
            labelMonthSelect: $t('client.datepicker.labelMonthSelect'),
            labelYearSelect: $t('client.datepicker.labelYearSelect')
        };
    }

    clear() {
        this.pickadate.clear();
    }

    render() {
        let defaultDate = '';
        if (this.props.defaultValue) {
            let defaultValue = new Date(this.props.defaultValue);

            let defaultMonth = `${defaultValue.getMonth() + 1}`;
            if (defaultMonth.length < 2)
                defaultMonth = `0${defaultMonth}`;

            let defaultDay = `${defaultValue.getDate()}`;
            if (defaultDay.length < 2)
                defaultDay = `0${defaultDay}`;

            defaultDate = `${defaultValue.getFullYear()}/${defaultMonth}/${defaultDay}`;
        }

        return (
            <input className="form-control" type="text" ref="elem"
              data-value={ defaultDate }
            />
        );
    }

}
