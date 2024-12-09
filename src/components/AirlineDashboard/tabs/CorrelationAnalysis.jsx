// CorrelationAnalysis.jsx
import React, { useState, useMemo } from 'react';
import { Card, Tabs, Select, Checkbox, Row, Col } from 'antd';
import { Line } from '@ant-design/plots';
import Big from 'big.js';

// Placeholder correlation functions. Replace with a proper stats library or your own implementations.
function pearsonCorrelation(x, y) {
  // Compute Pearson correlation
  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  const numerator = x.reduce((acc, xi, i) => acc + (xi - meanX)*(y[i]-meanY),0);
  const denominator = Math.sqrt(x.reduce((acc, xi)=>acc+(xi-meanX)**2,0)*y.reduce((acc, yi)=>acc+(yi-meanY)**2,0));
  return denominator === 0 ? 0 : numerator/denominator;
}

function kendallCorrelation(x, y) {
  // Compute Kendall tau-b correlation
  // Simple approximation. For more accurate results, use a stats library
  let concordant = 0;
  let discordant = 0;
  for (let i=0; i<x.length-1; i++){
    for (let j=i+1; j<x.length; j++){
      const diffX = x[i]-x[j];
      const diffY = y[i]-y[j];
      if(diffX*diffY>0) concordant++;
      else if(diffX*diffY<0) discordant++;
    }
  }
  const n = x.length;
  const tau = (concordant - discordant) / (0.5*n*(n-1));
  return tau;
}

function spearmanCorrelation(x, y) {
  // Compute Spearman's rank correlation
  // Convert to ranks
  function rankArray(arr){
    const sorted = [...arr].map((val,i)=>({val, i})).sort((a,b)=>a.val-b.val);
    const ranks = [];
    for (let i=0; i<sorted.length; i++){
      ranks[sorted[i].i] = i+1;
    }
    return ranks;
  }
  const rx = rankArray(x);
  const ry = rankArray(y);
  return pearsonCorrelation(rx, ry);
}

// Align and aggregate data by year for all metrics, including stock
// We assume airlineData is quarterly or yearly, operatingData is quarterly or yearly,
// and stockData is daily. We will aggregate all to yearly averages or sums.
// Adjust logic as needed based on actual data frequency.
function aggregateByYearAirlineData(airlineData) {
  const metrics = ["ASM","RPM","LOAD_FACTOR","YIELD","CASM","RASM","PRASM","OP_REVENUES","OP_EXPENSES","TRANS_REV_PAX"];
  const aggregated = {};
  airlineData.forEach(d=>{
    const year = d.YEAR;
    if (!year) return;
    if(!aggregated[year]) {
      aggregated[year] = {count:0};
      metrics.forEach(m=>aggregated[year][m]=Big(0));
    }
    aggregated[year].count++;
    metrics.forEach(m=>{
      aggregated[year][m]=aggregated[year][m].plus(Big(d[m]||0));
    });
  });
  // Average or sum?
  // LOAD_FACTOR, YIELD, CASM, RASM, PRASM might be averages
  // OP_REVENUES, OP_EXPENSES, TRANS_REV_PAX can be summed.
  // ASM,RPM typically sum over quarters.
  // For simplicity: sum everything except those explicitly known as rates (we can average them).
  // We'll treat LOAD_FACTOR, YIELD, CASM, RASM, PRASM as averages. Everything else sum.
  const rateMetrics = ["LOAD_FACTOR","YIELD","CASM","RASM","PRASM"];
  
  const result = [];
  for (const year in aggregated) {
    const obj = {YEAR: Number(year)};
    const c = aggregated[year].count;
    for (const m of metrics) {
      if (rateMetrics.includes(m)) {
        obj[m] = aggregated[year][m].toNumber()/c;
      } else {
        obj[m] = aggregated[year][m].toNumber();
      }
    }
    result.push(obj);
  }
  return result.sort((a,b)=>a.YEAR-b.YEAR);
}

function aggregateByYearOperatingData(operatingData) {
  // We only need FUEL_FLY_OPS as per instructions
  const aggregated = {};
  operatingData.forEach(d=>{
    const year = d.YEAR;
    if(!year) return;
    if(!aggregated[year]) {
      aggregated[year] = Big(0);
    }
    aggregated[year] = aggregated[year].plus(Big(d.FUEL_FLY_OPS||0));
  });
  const result = [];
  for (const year in aggregated) {
    result.push({YEAR:Number(year),FUEL_FLY_OPS:aggregated[year].toNumber()});
  }
  return result.sort((a,b)=>a.YEAR-b.YEAR);
}

function aggregateByYearStock(stockData) {
  // We'll take yearly average of Adj Close
  const aggregated = {};
  stockData.forEach(d=>{
    const date = new Date(d.Date);
    const year = date.getFullYear();
    if(!aggregated[year]) {
      aggregated[year]= {count:0, sum:Big(0)};
    }
    aggregated[year].count++;
    aggregated[year].sum = aggregated[year].sum.plus(Big(d['Adj Close']||0));
  });
  const result = [];
  for (const year in aggregated) {
    result.push({YEAR:Number(year), STOCK_PRICE: aggregated[year].sum.div(aggregated[year].count).toNumber()});
  }
  return result.sort((a,b)=>a.YEAR-b.YEAR);
}

const metricsList = [
  {value:'ASM', label:'ASM'},
  {value:'RPM', label:'RPM'},
  {value:'LOAD_FACTOR', label:'Load Factor'},
  {value:'YIELD', label:'Yield'},
  {value:'CASM', label:'CASM'},
  {value:'RASM', label:'RASM'},
  {value:'PRASM', label:'PRASM'},
  {value:'OP_REVENUES', label:'Operating Revenue'},
  {value:'OP_EXPENSES', label:'Operating Expense'},
  {value:'TRANS_REV_PAX', label:'Trans Rev Pax'},
  {value:'FUEL_FLY_OPS', label:'Fuel Expense'},
];

const CorrelationAnalysis = ({airlineData,operatingData,stockData}) => {
  // Aggregate all data by year
  const airlineYearly = useMemo(()=>aggregateByYearAirlineData(airlineData),[airlineData]);
  const operatingYearly = useMemo(()=>aggregateByYearOperatingData(operatingData),[operatingData]);
  const stockYearly = useMemo(()=>aggregateByYearStock(stockData),[stockData]);

  // Merge all into a single dataset by year
  const mergedData = useMemo(()=>{
    // We join on YEAR
    const map = {};
    stockYearly.forEach(d=> map[d.YEAR]={YEAR:d.YEAR,STOCK_PRICE:d.STOCK_PRICE});
    airlineYearly.forEach(d=>{
      if(!map[d.YEAR]) map[d.YEAR]={YEAR:d.YEAR};
      Object.assign(map[d.YEAR],d);
    });
    operatingYearly.forEach(d=>{
      if(!map[d.YEAR]) map[d.YEAR]={YEAR:d.YEAR};
      map[d.YEAR].FUEL_FLY_OPS=d.FUEL_FLY_OPS;
    });
    return Object.values(map).filter(d=>d.STOCK_PRICE!==undefined); // ensure we have stock price for that year
  },[airlineYearly,operatingYearly,stockYearly]);

  // Compute correlations
  const correlationData = useMemo(()=>{
    const x = mergedData.map(d=>d.STOCK_PRICE);
    const corr = {
      pearson:[],
      kendall:[],
      spearman:[]
    };
    for (const m of metricsList.map(m=>m.value)) {
      if (!mergedData.every(d=> d[m]!==undefined)) continue;
      const y = mergedData.map(d=>d[m]);
      corr.pearson.push({metric:m, value:pearsonCorrelation(x,y)});
      corr.kendall.push({metric:m, value:kendallCorrelation(x,y)});
      corr.spearman.push({metric:m, value:spearmanCorrelation(x,y)});
    }
    return corr;
  },[mergedData]);

  // Handle metric selection for the chart
  // By default, select all metrics. Stock Price is always included.
  const [selectedMetrics, setSelectedMetrics] = useState(metricsList.map(m=>m.value));

  // Prepare chart data
  const chartData = useMemo(()=>{
    // We always show STOCK_PRICE, plus selected metrics
    // We'll show them on the same chart. The user can add or remove metrics.
    // We'll assume YEAR on x-axis
    const data = [];
    mergedData.forEach(d=>{
      // Stock Price
      data.push({year: d.YEAR.toString(), metric:'STOCK_PRICE', value:d.STOCK_PRICE});
      selectedMetrics.forEach(m=>{
        if(d[m]!==undefined) {
          data.push({year:d.YEAR.toString(), metric:m, value:d[m]});
        }
      });
    });
    return data;
  },[mergedData,selectedMetrics]);

  // Chart config
  // We'll just show multiple lines. The user can see them together.
  const chartConfig = {
    data: chartData,
    xField:'year',
    yField:'value',
    seriesField:'metric',
    smooth:true,
    height:400,
    legend:{ position:'top'},
    tooltip:{
      showTitle:true,
      title:'year',
    }
  };

  // Rendering correlation tables: We'll just show them as text or you can use a small table
  const renderCorrelationTable = (corrArray) => {
    return (
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr style={{borderBottom:'1px solid #ddd'}}>
            <th style={{textAlign:'left',padding:'8px'}}>Metric</th>
            <th style={{textAlign:'left',padding:'8px'}}>Correlation</th>
          </tr>
        </thead>
        <tbody>
          {corrArray.map(c=>(
            <tr key={c.metric} style={{borderBottom:'1px solid #f0f0f0'}}>
              <td style={{padding:'8px'}}>{metricsList.find(m=>m.value===c.metric)?.label || c.metric}</td>
              <td style={{padding:'8px'}}>{c.value.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  };

  return (
    <Card className="custom-card" title="Stock Price Correlation & Comparison" style={{ marginTop: '24px' }}>
      <Row gutter={16} style={{marginBottom:'16px'}}>
        <Col span={24}>
          <div style={{marginBottom:'8px'}}>Select Metrics to Display on Chart (Stock Price always included):</div>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select metrics"
            value={selectedMetrics}
            onChange={setSelectedMetrics}
            allowClear
            options={metricsList}
          />
        </Col>
      </Row>

      <Line {...chartConfig} />

      <Tabs
        defaultActiveKey="1"
        style={{ marginTop: '24px' }}
        destroyInactiveTabPane
        items={[
          {
            key:'1',
            label:'Pearson Correlation',
            children: renderCorrelationTable(correlationData.pearson)
          },
          {
            key:'2',
            label:'Kendall Correlation',
            children: renderCorrelationTable(correlationData.kendall)
          },
          {
            key:'3',
            label:'Spearman Correlation',
            children: renderCorrelationTable(correlationData.spearman)
          },
        ]}
      />
    </Card>
  );
};

export default React.memo(CorrelationAnalysis);
