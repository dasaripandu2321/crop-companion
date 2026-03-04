from app import mock_predict

print('input1 ->', mock_predict({'N':80,'P':48,'K':40,'temperature':24,'humidity':82,'ph':6.5,'rainfall':230}))
print('input2 ->', mock_predict({'N':0,'P':0,'K':0,'temperature':0,'humidity':0,'ph':0,'rainfall':0}))
print('input3 ->', mock_predict({'N':120,'P':45,'K':20,'temperature':25,'humidity':60,'ph':7.0,'rainfall':80}))
