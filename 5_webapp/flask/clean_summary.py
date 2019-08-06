from string import punctuation

def clean_sum(summary):
    sum_list = list(summary)
    for i in range(0,len(sum_list)):
        if sum_list[i] in punctuation:
            sum_list[i-1], sum_list[i]=sum_list[i], sum_list[i-1]
    return ''.join(sum_list)