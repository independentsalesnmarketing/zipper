#!/usr/bin/env python3
"""Export source-backed local FCC coverage summaries from the nationwide SQLite DB.
Usage: python scripts/broadband-data/build_local_insights.py /path/to/internet4all_national_broadband.sqlite output.json
The input database is generated separately from the original FCC/Esri extraction.
"""
import json,sqlite3,sys
from collections import defaultdict
from pathlib import Path
GROUP={"50":"fiber","40":"cable","10":"copper","70":"wireless","71":"wireless","72":"wireless","60":"satellite","61":"satellite"}
def generate(source):
 c=sqlite3.connect("file:"+str(Path(source).resolve())+"?mode=ro",uri=True)
 c.row_factory=sqlite3.Row
 result={}
 for row in c.execute("SELECT zcta,zcta_total_bsls,reporting_provider_count FROM zip_market_summary"):
  result[row["zcta"]]={"bsl":row["zcta_total_bsls"],"reporters":row["reporting_provider_count"],"fiber":[],"cable":[],"wireless":[]}
 candidates=defaultdict(lambda:defaultdict(dict))
 for row in c.execute("SELECT zcta,provider_name,frn,technology_code,provider_served_bsls,estimate_100_20_pct FROM zip_coverage"):
  z=row["zcta"];group=GROUP.get(str(row["technology_code"]))
  if z not in result or group not in ("fiber","cable","wireless"):continue
  pct=float(row["estimate_100_20_pct"] or 0)
  if pct<(5 if group in ("fiber","cable") else 10):continue
  key=(row["provider_name"],row["frn"])
  record={"name":row["provider_name"],"frn":row["frn"],"tech":str(row["technology_code"]),"pct":round(pct,1),"count":int(row["provider_served_bsls"])}
  old=candidates[z][group].get(key)
  if not old or record["pct"]>old["pct"]:candidates[z][group][key]=record
 for z,groups in candidates.items():
  for g,d in groups.items():result[z][g]=sorted(d.values(),key=lambda x:(-x["pct"],x["name"]))[:4]
 return {"meta":{"source":"FCC BDC December 2025 via Esri","geography":"2020 Census ZCTA, H3 centroid","measure":"Provider-reported 100/20 Mbps served BSL share, not street-level eligibility"},"zips":result}
if __name__=="__main__":
 if len(sys.argv)!=3:raise SystemExit("Pass SQLite input and JSON output")
 data=generate(sys.argv[1]);Path(sys.argv[2]).write_text(json.dumps(data,separators=(",",":"))+"\n")
 print("Wrote",len(data["zips"]),"ZCTA research summaries to",sys.argv[2])
