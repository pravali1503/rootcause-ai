import { Dataset } from '../types';

export const SAMPLE_DATASETS: Dataset[] = [
  {
    id: 'retail-revenue',
    name: 'Retail Omnichannel Revenue Drop',
    industry: 'E-Commerce & Retail',
    scenario: 'In Q3, total sales dropped by -$342,000 (-13.5%). This investigation reveals which product categories and regions drove the drop versus which categories helped cushion the fall.',
    fileName: 'retail_quarterly_sales.csv',
    rawCsv: `Quarter,Region,Category,Channel,Customer_Tier,Units_Sold,Revenue,Discounts,Returns_Amount,Gross_Profit
2024-Q1,North America,Electronics,Direct Web,Enterprise,1200,600000,30000,12000,240000
2024-Q1,North America,Apparel,Direct Web,SMB,3400,204000,15000,8000,102000
2024-Q1,North America,Home & Kitchen,Retail Stores,Consumer,2800,168000,8000,6000,67000
2024-Q1,Europe,Electronics,Direct Web,Enterprise,950,475000,22000,9000,190000
2024-Q1,Europe,Apparel,Affiliate,Consumer,2200,132000,10000,5000,66000
2024-Q1,Asia-Pacific,Beauty,Direct Web,Consumer,4100,205000,9000,3000,123000
2024-Q1,Asia-Pacific,Electronics,Marketplace,SMB,1100,550000,25000,11000,220000
2024-Q1,Latin America,Home & Kitchen,Retail Stores,Consumer,1800,90000,4000,2500,36000
2024-Q2,North America,Electronics,Direct Web,Enterprise,1350,675000,32000,14000,270000
2024-Q2,North America,Apparel,Direct Web,SMB,3600,216000,16000,9000,108000
2024-Q2,North America,Home & Kitchen,Retail Stores,Consumer,2950,177000,9000,6500,70800
2024-Q2,North America,Beauty,Marketplace,Consumer,2100,105000,5000,2000,63000
2024-Q2,Europe,Electronics,Direct Web,Enterprise,1020,510000,24000,10000,204000
2024-Q2,Europe,Apparel,Affiliate,Consumer,2400,144000,11000,5500,72000
2024-Q2,Europe,Home & Kitchen,Retail Stores,Consumer,1900,114000,5500,3800,45600
2024-Q2,Asia-Pacific,Beauty,Direct Web,Consumer,4600,230000,10000,3500,138000
2024-Q2,Asia-Pacific,Electronics,Marketplace,SMB,1180,590000,26000,12000,236000
2024-Q2,Latin America,Home & Kitchen,Retail Stores,Consumer,2000,100000,4500,2800,40000
2024-Q3,North America,Electronics,Direct Web,Enterprise,680,340000,18000,8000,136000
2024-Q3,North America,Apparel,Direct Web,SMB,3500,210000,17000,9500,105000
2024-Q3,North America,Home & Kitchen,Retail Stores,Consumer,2800,168000,9000,6800,67200
2024-Q3,North America,Beauty,Marketplace,Consumer,2400,120000,6000,2200,72000
2024-Q3,Europe,Electronics,Direct Web,Enterprise,910,455000,23000,11000,182000
2024-Q3,Europe,Apparel,Affiliate,Consumer,2300,138000,12000,6000,69000
2024-Q3,Europe,Home & Kitchen,Retail Stores,Consumer,1850,111000,6000,4000,44400
2024-Q3,Asia-Pacific,Beauty,Direct Web,Consumer,5800,290000,12000,4000,174000
2024-Q3,Asia-Pacific,Electronics,Marketplace,SMB,1040,520000,25000,13000,208000
2024-Q3,Latin America,Home & Kitchen,Retail Stores,Consumer,1920,96000,4800,3100,38400
2024-Q4,North America,Electronics,Direct Web,Enterprise,1400,700000,35000,15000,280000
2024-Q4,North America,Apparel,Direct Web,SMB,4100,246000,19000,10000,123000
2024-Q4,North America,Home & Kitchen,Retail Stores,Consumer,3300,198000,11000,8000,79200
2024-Q4,North America,Beauty,Marketplace,Consumer,2600,130000,6500,2500,78000
2024-Q4,Europe,Electronics,Direct Web,Enterprise,1100,550000,26000,12000,220000
2024-Q4,Europe,Apparel,Affiliate,Consumer,2700,162000,13000,7000,81000
2024-Q4,Europe,Home & Kitchen,Retail Stores,Consumer,2200,132000,7000,4500,52800
2024-Q4,Asia-Pacific,Beauty,Direct Web,Consumer,6200,310000,14000,4500,186000
2024-Q4,Asia-Pacific,Electronics,Marketplace,SMB,1250,625000,28000,14000,250000
2024-Q4,Latin America,Home & Kitchen,Retail Stores,Consumer,2300,115000,5200,3400,46000`
  },
  {
    id: 'saas-churn',
    name: 'SaaS Monthly Churn & Revenue Attrition',
    industry: 'B2B Software & Cloud Subscriptions',
    scenario: 'Monthly churn jumped from $54,000 to $98,500 (+82.4%). This investigation pinpoints which customer plan tiers, industries, and billing cycles suffered the highest cancellations.',
    fileName: 'saas_churn_analysis.csv',
    rawCsv: `Month,Plan_Tier,Industry,Billing_Cycle,Tenure_Cohort,Active_Accounts,Monthly_Recurring_Revenue,Churned_MRR,Expansion_MRR,Net_New_MRR
2024-03,Starter,Fintech,Monthly,<6_Months,420,42000,4200,2100,1200
2024-03,Starter,Healthcare,Monthly,<6_Months,310,31000,2400,1500,2200
2024-03,Professional,Retail,Annual,6-18_Months,180,72000,3600,7200,9400
2024-03,Professional,Fintech,Monthly,6-18_Months,150,60000,4800,6000,3600
2024-03,Enterprise,Fintech,Annual,>18_Months,45,180000,4000,18000,22000
2024-03,Enterprise,Healthcare,Annual,>18_Months,50,200000,0,16000,20000
2024-03,Professional,Education,Annual,6-18_Months,90,36000,1800,3600,4200
2024-04,Starter,Fintech,Monthly,<6_Months,435,43500,4500,2200,1800
2024-04,Starter,Healthcare,Monthly,<6_Months,320,32000,2500,1600,2100
2024-04,Professional,Retail,Annual,6-18_Months,185,74000,3700,7400,8500
2024-04,Professional,Fintech,Monthly,6-18_Months,155,62000,5000,6200,4100
2024-04,Enterprise,Fintech,Annual,>18_Months,46,184000,4000,19000,21000
2024-04,Enterprise,Healthcare,Annual,>18_Months,52,208000,0,17000,21000
2024-04,Professional,Education,Annual,6-18_Months,92,36800,1900,3700,3900
2024-05,Starter,Fintech,Monthly,<6_Months,450,45000,7200,2300,-1200
2024-05,Starter,Healthcare,Monthly,<6_Months,330,33000,2600,1700,2400
2024-05,Professional,Retail,Annual,6-18_Months,190,76000,3800,7600,8200
2024-05,Professional,Fintech,Monthly,6-18_Months,160,64000,6400,6400,1800
2024-05,Enterprise,Fintech,Annual,>18_Months,48,192000,8000,20000,16000
2024-05,Enterprise,Healthcare,Annual,>18_Months,54,216000,0,18000,22000
2024-05,Professional,Education,Annual,6-18_Months,95,38000,2000,3800,4000
2024-06,Starter,Fintech,Monthly,<6_Months,390,39000,31200,1500,-18200
2024-06,Starter,Healthcare,Monthly,<6_Months,325,32500,3100,1600,1200
2024-06,Professional,Retail,Annual,6-18_Months,188,75200,4200,7500,6100
2024-06,Professional,Fintech,Monthly,6-18_Months,142,56800,18500,4200,-11200
2024-06,Enterprise,Fintech,Annual,>18_Months,48,192000,16000,15000,3000
2024-06,Enterprise,Healthcare,Annual,>18_Months,55,220000,0,19000,23000
2024-06,Professional,Education,Annual,6-18_Months,96,38400,2100,3800,3900
2024-07,Starter,Fintech,Monthly,<6_Months,370,37000,12000,1800,-4200
2024-07,Starter,Healthcare,Monthly,<6_Months,335,33500,2800,1800,2500
2024-07,Professional,Retail,Annual,6-18_Months,192,76800,3900,7700,7800
2024-07,Professional,Fintech,Monthly,6-18_Months,145,58000,8200,5800,2200
2024-07,Enterprise,Fintech,Annual,>18_Months,49,196000,8000,21000,19000
2024-07,Enterprise,Healthcare,Annual,>18_Months,56,224000,0,20000,24000
2024-07,Professional,Education,Annual,6-18_Months,98,39200,2000,4000,4200`
  },
  {
    id: 'logistics-delays',
    name: 'Regional Supply Chain & Late Deliveries',
    industry: 'Logistics & Fleet Operations',
    scenario: 'Late deliveries jumped by +2,350 packages (+78.6%) between Week 42 and Week 43. This investigation breaks down the delay bottleneck by warehouse hub, delivery carrier, and weather conditions.',
    fileName: 'supply_chain_dispatch.csv',
    rawCsv: `Week,Hub_Location,Carrier_Partner,Delivery_Priority,Weather_Condition,Dispatched_Orders,Late_Deliveries,Transit_Cost_USD,Fuel_Surcharge,Escalations
W40,Chicago,SwiftFreight,Express,Clear,4500,210,54000,6200,18
W40,Chicago,In-House Fleet,Standard,Clear,8200,160,82000,9100,12
W40,Atlanta,Regional Express,Standard,Clear,6800,140,68000,7500,9
W40,Dallas,SwiftFreight,Express,Clear,5100,250,61200,6800,22
W40,Dallas,AirCargo Partner,Same-Day,Clear,1200,45,36000,4100,8
W40,Seattle,In-House Fleet,Standard,Rain,5900,180,64900,7200,14
W40,Phoenix,Regional Express,Standard,Clear,4800,90,48000,5300,5
W41,Chicago,SwiftFreight,Express,Rain,4600,240,55200,6400,20
W41,Chicago,In-House Fleet,Standard,Rain,8400,180,84000,9300,15
W41,Atlanta,Regional Express,Standard,Clear,7000,150,70000,7700,11
W41,Dallas,SwiftFreight,Express,Clear,5300,260,63600,7100,24
W41,Dallas,AirCargo Partner,Same-Day,Clear,1250,50,37500,4300,9
W41,Seattle,In-House Fleet,Standard,Rain,6100,195,67100,7500,16
W41,Phoenix,Regional Express,Standard,Clear,4950,95,49500,5500,6
W42,Chicago,SwiftFreight,Express,Clear,4700,230,56400,6500,19
W42,Chicago,In-House Fleet,Standard,Clear,8500,175,85000,9400,14
W42,Atlanta,Regional Express,Standard,Clear,7100,155,71000,7800,10
W42,Dallas,SwiftFreight,Express,Clear,5400,270,64800,7200,25
W42,Dallas,AirCargo Partner,Same-Day,Clear,1300,55,39000,4400,11
W42,Seattle,In-House Fleet,Standard,Clear,6200,170,68200,7600,12
W42,Phoenix,Regional Express,Standard,Clear,5100,100,51000,5600,7
W43,Chicago,SwiftFreight,Express,Winter Storm,4100,1450,61500,8900,185
W43,Chicago,In-House Fleet,Standard,Winter Storm,7800,620,93600,12100,74
W43,Atlanta,Regional Express,Standard,Clear,7200,160,72000,7900,12
W43,Dallas,SwiftFreight,Express,Clear,5500,290,66000,7300,28
W43,Dallas,AirCargo Partner,Same-Day,Clear,1320,60,39600,4500,13
W43,Seattle,In-House Fleet,Standard,Rain,6300,210,69300,7700,18
W43,Phoenix,Regional Express,Standard,Clear,5200,105,52000,5700,8
W44,Chicago,SwiftFreight,Express,Clear,4600,310,55200,6400,28
W44,Chicago,In-House Fleet,Standard,Clear,8300,190,83000,9200,16
W44,Atlanta,Regional Express,Standard,Clear,7300,165,73000,8000,14
W44,Dallas,SwiftFreight,Express,Clear,5600,280,67200,7400,26
W44,Dallas,AirCargo Partner,Same-Day,Clear,1350,58,40500,4600,12
W44,Seattle,In-House Fleet,Standard,Clear,6400,185,70400,7800,15
W44,Phoenix,Regional Express,Standard,Clear,5300,108,53000,5800,9`
  },
  {
    id: 'edge-cases-stress',
    name: 'Data Quality & Edge Cases Stress-Test',
    industry: 'Synthetic Benchmark / Quality Audit',
    scenario: 'A test containing newly launched segments (starting at 0), missing dates, empty cells, duplicate rows, and offsetting positive/negative swings to verify calculations remain accurate.',
    fileName: 'data_quality_stress_test.csv',
    rawCsv: `Period,Segment,Sub_Channel,Customer_Cohort,Metric_Value,Secondary_Metric,Notes
Period_1,Legacy Alpha,Organic,Returning,1000,50,Normal baseline
Period_1,Legacy Beta,Paid Ads,New,500,20,Normal baseline
Period_1,Legacy Gamma,Affiliate,Returning,300,15,Normal baseline
Period_1,Zero Baseline Delta,Organic,New,0,0,Baseline is zero explicitly
Period_1,Offsetting Hero,Direct,Returning,200,10,Small baseline
Period_1,Duplicate Row Item,Organic,New,150,5,Duplicate test row
Period_1,Duplicate Row Item,Organic,New,150,5,Duplicate test row
Period_1,Missing Next Period,Paid Ads,Returning,400,18,Discontinues in T1
Period_2,Legacy Alpha,Organic,Returning,400,22,Plummeted by -600
Period_2,Legacy Beta,Paid Ads,New,100,5,Plummeted by -400
Period_2,Legacy Gamma,Affiliate,Returning,280,14,Slight drop -20
Period_2,Zero Baseline Delta,Organic,New,250,12,Grew from zero to 250 (+inf % change)
Period_2,Offsetting Hero,Direct,Returning,750,35,Massive positive surge +550
Period_2,New Emergent Segment,Marketplace,New,300,15,Did not exist in Period 1
Period_2,Duplicate Row Item,Organic,New,150,5,Duplicate in comp period
Period_2,Null Test Row,Organic,New,,0,Null value handling test
Period_3,Legacy Alpha,Organic,Returning,850,45,Recovery period
Period_3,Legacy Beta,Paid Ads,New,350,18,Partial recovery
Period_3,Legacy Gamma,Affiliate,Returning,320,16,Growth
Period_3,Zero Baseline Delta,Organic,New,280,14,Maintained
Period_3,Offsetting Hero,Direct,Returning,600,28,Sustained
Period_3,New Emergent Segment,Marketplace,New,450,22,Growth`
  }
];
