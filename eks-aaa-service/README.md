# EKS AAA SERVICE

PLEASE USE NODE 10.x.x

This project is set up follow this instruction:

- https://levelup.gitconnected.com/setup-express-with-typescript-in-3-easy-steps-484772062e01
- https://developer.okta.com/blog/2018/11/15/node-express-typescript


AAA Host:

- alpha: adminws.icp2.cp.us1.reuintint.com
- beta: adminws.cp.ntc.reuppint.com
- dtc: adminws.cp.dtc.reuint.com
- hdc: adminws.cp.hdc.reuint.com
- stc: adminws.cp.stc.reuint.com

Example API:

```
# get basic info
curl http://localhost:9094/api/v1/user/PAXTRA77552 -H "px-access-key: inevitable.thanos"

# get custom info
curl -XPOST http://localhost:9094/api/v1/user/PAXTRA77552  -H "px-access-key: inevitable.thanos" -d '["PROFILES.uuid", "PROFILES.UP"]'

# get PO
curl http://localhost:9094/api/v1/user/PAXTRA77552/po/GUIDES.CEONOFF  -H "px-access-key: inevitable.thanos"

# Delete cache
curl -XDELETE http://localhost:9094/api/v1/user/PAXTRA77552  -H "px-access-key: inevitable.thanos"

# get name and email
curl http://localhost:9094/api/v1/user/PAXTRA77552/name-email -H "px-access-key: inevitable.thanos"

# get name and email list
curl -XPOST http://localhost:9094/api/v1/users/name-email -H "px-access-key: inevitable.thanos" -d '["PAXTRA77557", "PAXTRA77552", "PAXTRA77553", "PAXTRA77554", "PAXTRA77555", "PAXTRA77556"]'

# Delete cache name and email
curl -XDELETE http://localhost:9094/api/v1/user/PAXTRA77552/name-email -H "px-access-key: inevitable.thanos"
```

# Deploy to Container Repository

```
# Login to refinitiv aws
cloud-tool-fr login -u mgmt\\m{XXXXXXX} -p {XXXXXX}

# Login to ecr
$(aws ecr get-login --no-include-email --region eu-west-1)

# build app & build docker file
npm run build
docker build -t a205915-ecs-aaa-service .

# tag with 'latest'

docker tag a205915-ecs-aaa-service:latest 636803032673.dkr.ecr.eu-west-1.amazonaws.com/a205915-ecs-aaa-service:latest

# push
docker push 636803032673.dkr.ecr.eu-west-1.amazonaws.com/a205915-ecs-aaa-service:latest
```