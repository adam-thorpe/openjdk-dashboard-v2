import React, { Component } from 'react';
import { api } from "../api";
import LineChart from "./LineChart";
import BarChart from "./BarChart";
import moment from 'moment';
import { Button, Radio, Checkbox } from 'antd';
import { Stats } from 'fs';
import './Trends.css';

export default class Trends extends Component {
    state = { 
        series: undefined,
        series2: undefined,
        monthlyData: undefined,
        categories: undefined,
        args: {
            type: 'daily',
            source: undefined,
            feature_version: undefined,
            jvm_impl: undefined
        },
        args2: {
            type: 'daily',
            source: undefined,
            feature_version: undefined,
            jvm_impl: undefined
        },
        monthlyArgs: {
            type: 'monthly',
            source: undefined,
            feature_version: undefined,
            jvm_impl: undefined
        }
    };

    async componentDidMount() {
        this.updateData(1, this.state.args);
        this.updateData(2, this.state.args2, false);
        this.updateMonthlyData();
    }

    async updateData(seriesID, args, visible = true) {
        let params = {}
        if(args.source) params.source = args.source
        if(args.feature_version) params.feature_version = args.feature_version
        if(args.jvm_impl) params.jvm_impl = args.jvm_impl

        const data = await api.tracking(params)

        switch(seriesID) {   
            case 1: this.setState({series: this.processData(seriesID, data, args.type, visible)}); break;
            case 2: this.setState({series2: this.processData(seriesID, data, args.type, visible)}); break;
        }

        if (data.length > 0) {
            const categories = data.map(({ date }) => moment(date).format('DD-MM-YYYY'));
            this.setState({categories})
        }
    }

    processData(seriesID, data, type, visibleTatal = false) {
        var typeData;
        switch(type) {
            case 'daily': typeData = data.map(({ daily }) => daily); break;
            case 'total': typeData = data.map(({ total }) => total); break;
        }

        const series = [{
            name: "Series " + seriesID,
            data: typeData,
            visible: (data.length != 0) && visibleTatal
        }];

        return series;
    }

    async updateMonthlyData() {
        var monthlyArgs = this.state.monthlyArgs

        let params = {}
        if(monthlyArgs.source) params.source = monthlyArgs.source
        if(monthlyArgs.feature_version) params.feature_version = monthlyArgs.feature_version
        if(monthlyArgs.jvm_impl) params.jvm_impl = monthlyArgs.jvm_impl

        const data = await api.monthly(params)

        var monthlyData = {}
        data.forEach(data => monthlyData[this.parseMonth(data.month)] = data[monthlyArgs.type])

        this.setState({monthlyData})
    }

    parseMonth(month) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        var b = month.split("-")
        return monthNames[b[1] - 1] + " " + b[0]
    }

    renderFilters(seriesID, args) {
        return <div className="filters">
            <div className="column">
                <div>Type</div>
                <Radio.Group name={"type"}
                    defaultValue={args.type}
                    onChange={e => {args.type = e.target.value; this.updateData(seriesID, args)}}
                    options={[
                        { label: 'Daily', value: 'daily' },
                        { label: 'Total', value: 'total' }
                    ]}
                />
            </div>
            <div className="column">
                <div>Source</div>
                <Radio.Group name={"source"}
                    defaultValue={args.source}
                    onChange={e => {args.source = e.target.value; this.updateData(seriesID, args)}}
                    options={[
                        { label: 'None', value: undefined },
                        { label: 'Github', value: 'github' },
                        { label: 'Docker', value: 'dockerhub' }
                    ]}
                />
            </div>
            <div className="column">
                <div>Feature Version*</div>
                <Radio.Group name={"feature_version"}
                    defaultValue={args.feature_version}
                    onChange={e => {args.feature_version = e.target.value; this.updateData(seriesID, args)}}
                    options={[
                        { label: 'None', value: undefined },
                        { label: 'JDK 8', value: 8 },
                        { label: 'JDK 9', value: 9 },
                        { label: 'JDK 10', value: 10 },
                        { label: 'JDK 11', value: 11 },
                        { label: 'JDK 12', value: 12 },
                        { label: 'JDK 13', value: 13 },
                        { label: 'JDK 14', value: 14 },
                    ]}
                />
            </div>
            <div className="column">
                <div>JVM Impl*</div>
                <Radio.Group name={"jvm_impl"}
                    defaultValue={args.jvm_impl}
                    onChange={e => {args.jvm_impl = e.target.value; this.updateData(seriesID, args)}}
                    options={[
                        { label: 'None', value: undefined },
                        { label: 'HotSpot', value: 'hotspot' },
                        { label: 'OpenJ9', value: 'openj9' }
                    ]}
                />
            </div>
        </div>
    }

    renderMonthlyFilters() {
        var monthlyArgs = this.state.monthlyArgs

        return <div className="filters">
            <div className="column">
                <div>Type</div>
                <Radio.Group name={"type"}
                    defaultValue={monthlyArgs.type}
                    onChange={e => {monthlyArgs.type = e.target.value; this.updateMonthlyData()}}
                    options={[
                        { label: 'Monthly', value: 'monthly' },
                        { label: 'Total', value: 'total' }
                    ]}
                />
            </div>
            <div className="column">
                <div>Source</div>
                <Radio.Group name={"source"}
                    defaultValue={monthlyArgs.source}
                    onChange={e => {monthlyArgs.source = e.target.value; this.updateMonthlyData()}}
                    options={[
                        { label: 'None', value: undefined },
                        { label: 'Github', value: 'github' },
                        { label: 'Docker', value: 'dockerhub' }
                    ]}
                />
            </div>
            <div className="column">
                <div>Feature Version*</div>
                <Radio.Group name={"feature_version"}
                    defaultValue={monthlyArgs.feature_version}
                    onChange={e => {monthlyArgs.feature_version = e.target.value; this.updateMonthlyData()}}
                    options={[
                        { label: 'None', value: undefined },
                        { label: 'JDK 8', value: 8 },
                        { label: 'JDK 9', value: 9 },
                        { label: 'JDK 10', value: 10 },
                        { label: 'JDK 11', value: 11 },
                        { label: 'JDK 12', value: 12 },
                        { label: 'JDK 13', value: 13 },
                        { label: 'JDK 14', value: 14 },
                    ]}
                />
            </div>
            <div className="column">
                <div>JVM Impl*</div>
                <Radio.Group name={"jvm_impl"}
                    defaultValue={monthlyArgs.jvm_impl}
                    onChange={e => {monthlyArgs.jvm_impl = e.target.value; this.updateMonthlyData()}}
                    options={[
                        { label: 'None', value: undefined },
                        { label: 'HotSpot', value: 'hotspot' },
                        { label: 'OpenJ9', value: 'openj9' }
                    ]}
                />
            </div>
        </div>
    }

    render() {
        let state = this.state;
    
        if (!state.series || !state.series2 || !state.monthlyData) return null;

        let fullSeries = []
        Array.prototype.push.apply(fullSeries, state.series)
        Array.prototype.push.apply(fullSeries, state.series2)

        return <>
            <LineChart series={fullSeries} categories={state.categories} name="Tracking Trends" />
            <div className="filters-box">
                {this.renderFilters(1, state.args)}
                {this.renderFilters(2, state.args2)}
            </div>
            <BarChart data={state.monthlyData} name="Monthly Trends" />
            <div className="filters-box">
                {this.renderMonthlyFilters()}
            </div>
            <p>*Does not include results from the Official Docker Repo</p>
        </>
    }
}