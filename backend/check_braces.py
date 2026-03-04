path='gemini_service.py'
s=open(path,'r',encoding='utf-8').read()
print('counts {, } ->', s.count('{'), s.count('}'))
bal=0
for i,ch in enumerate(s):
    if ch=='{': bal+=1
    elif ch=='}': bal-=1
    if bal<0:
        print('negative at',i)
        break
print('final balance',bal)
for idx,line in enumerate(s.splitlines(),1):
    if 'Mustard' in line:
        print('Mustard at line',idx, line)
        break
