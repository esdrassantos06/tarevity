'use client'
interface LogoProps {
  className?: string
  width?: string
  height?: string
}

export default function Logo({
  className,
  width = '100%',
  height = '100%',
}: LogoProps) {
  return (
    <svg
      viewBox="0 0 370 90"
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="matrix(0.95,0,0,0.95,0,0)">
        <path
          xmlns="http://www.w3.org/2000/svg"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M91.288,54.316c-0.643-1.411-1.308-2.543-1.854-3.376  c-0.561-0.856-1-1.405-1.173-1.624c-1.093-1.378-3.678-4.591-6.491-8.079V33.97c0-0.078-0.011-0.153-0.012-0.231V11.324  c0,0-3.258-2.207-5.854-3.204c-2.421-0.93-5.877-1.845-10.109-1.845c-4.783,0-8.664,1.18-11.464,2.457  c-1.411,0.643-2.543,1.308-3.376,1.854c-0.856,0.561-1.405,1-1.624,1.173c-1.378,1.094-4.591,3.678-8.079,6.491h-7.267  c-0.043,0-0.084,0.006-0.127,0.006H11.304c0,0-2.207,3.258-3.204,5.854c-0.93,2.421-1.844,5.877-1.844,10.109  c0,4.783,1.18,8.664,2.457,11.464c0.643,1.411,1.308,2.543,1.854,3.376c0.561,0.856,1,1.405,1.173,1.624  c1.093,1.378,3.678,4.591,6.491,8.079v7.267c0,0.085,0.011,0.167,0.013,0.251v22.396c0,0,3.258,2.207,5.854,3.204  c2.421,0.93,5.878,1.844,10.109,1.844c4.783,0,8.664-1.18,11.464-2.456c1.411-0.643,2.543-1.308,3.377-1.854  c0.856-0.561,1.405-1,1.624-1.173c1.378-1.093,4.591-3.678,8.079-6.491h7.267c0.046,0,0.091-0.007,0.137-0.007h22.543  c0,0,2.207-3.258,3.204-5.854c0.93-2.421,1.844-5.877,1.844-10.109C93.744,60.997,92.564,57.116,91.288,54.316z M71.654,28.71  c-1.421-1.505-3.546-2.565-5.787-2.565c-4.322,0-7.825,3.503-7.825,7.825c0,1.704,0.823,3.656,1.772,4.959  c0.86,1.068,5.101,6.337,9.078,11.287c-0.934-0.171-1.892-0.273-2.876-0.273c-0.87,0-1.721,0.076-2.554,0.211l-1.754-2.166  l-2.646-3.267l-2.646-3.267l-0.13-0.2c-1.54-2.022-2.454-4.547-2.454-7.285c0-3.323,1.347-6.332,3.525-8.51  c0.136-0.136,0.284-0.258,0.427-0.388c0.588-0.47,1.062-0.847,1.376-1.095c1.526-1.026,3.303-1.703,5.216-1.94  c0.448-0.05,0.919-0.082,1.419-0.082c1.133,0,2.158,0.142,3.075,0.373c0.001,0,0.003,0.001,0.005,0.001  c0.296,0.074,0.579,0.159,0.852,0.25c0.072,0.024,0.141,0.052,0.212,0.078c0.302,0.107,0.589,0.223,0.864,0.345  c0.23,0.103,0.457,0.21,0.679,0.327c0.081,0.042,0.159,0.086,0.237,0.129c0.957,0.534,1.834,1.192,2.607,1.956  c0.154,0.172,0.563,0.646,1.133,1.31c1.527,2.02,2.443,4.543,2.443,7.366l0,2.353C74.516,32.25,71.654,28.71,71.654,28.71z   M48.613,59.451c-0.539-1.188-1.219-2.308-2.024-3.34l-2.646-3.267l-2.646-3.267l-0.755-0.932c1.196-0.541,2.322-1.224,3.361-2.034  l3.267-2.646l3.267-2.646l0.948-0.768c0.539,1.188,1.219,2.307,2.023,3.339l2.646,3.267l2.646,3.267l0.756,0.933  c-1.196,0.541-2.322,1.224-3.36,2.034l-3.267,2.646l-3.267,2.646L48.613,59.451z M51.736,14.79  c0.721-0.572,5.792-4.646,14.059-4.646c7.342,0,12.094,3.175,12.094,3.175v10.1c0,0-2.435-3.07-7.056-4.55  c-0.251-0.083-0.507-0.152-0.764-0.222c-0.13-0.035-0.26-0.069-0.393-0.101c-1.223-0.301-2.494-0.478-3.809-0.478  c-0.318,0-0.629,0.029-0.942,0.048c-0.096,0.005-0.194,0.008-0.288,0.015c-0.232,0.018-0.463,0.038-0.692,0.065  c-4.676,0.521-7.327,2.85-7.374,2.892c-0.396,0.286-0.778,0.588-1.145,0.908c-4.261,3.398-17.143,13.777-18.908,15.199l-0.201,0.162  c-0.653,0.476-1.46,0.754-2.331,0.754c-2.185,0-3.956-1.771-3.956-3.956c0-1.134,0.477-2.155,1.24-2.877  C31.269,31.276,48.043,17.72,51.736,14.79z M36.458,22.119c-4.193,3.385-7.733,6.247-7.733,6.247  c-1.505,1.421-2.565,3.546-2.565,5.787c0,4.322,3.503,7.825,7.825,7.825c1.704,0,3.656-0.822,4.959-1.772  c1.068-0.86,6.337-5.101,11.287-9.078c-0.167,0.924-0.268,1.87-0.268,2.842c0,0.879,0.077,1.74,0.214,2.581l-2.174,1.76  l-3.267,2.646l-3.267,2.646l-0.2,0.13c-2.022,1.54-4.547,2.454-7.285,2.454c-3.323,0-6.332-1.347-8.51-3.525  c-0.224-0.224-0.434-0.463-0.64-0.704c-0.143-0.179-0.273-0.343-0.394-0.494c-1.556-2.028-2.491-4.558-2.491-7.312  c0-3.323,1.347-6.332,3.525-8.51c0.201-0.201,0.417-0.388,0.632-0.574c0.099-0.085,0.205-0.177,0.318-0.274  c2.069-1.672,4.711-2.677,7.679-2.677L36.458,22.119z M10.124,34.22c0-7.342,3.175-12.094,3.175-12.094h10.1  c0,0-5.332,4.213-5.332,12.094c0,5.871,3.003,9.23,3.003,9.23c0.124,0.158,0.316,0.401,0.555,0.701  c0.045,0.056,0.088,0.113,0.134,0.168c3.152,3.958,13.961,17.374,15.415,19.179l0.162,0.201c0.476,0.653,0.754,1.461,0.754,2.331  c0,2.185-1.771,3.956-3.956,3.956c-1.133,0-2.155-0.477-2.877-1.24c0,0-13.556-16.774-16.487-20.467  C14.197,47.558,10.124,42.488,10.124,34.22z M28.346,71.29c1.422,1.505,3.546,2.565,5.787,2.565c4.322,0,7.825-3.503,7.825-7.825  c0-1.704-0.822-3.656-1.772-4.959c-0.86-1.068-5.101-6.337-9.078-11.287c0.934,0.171,1.893,0.273,2.877,0.273  c0.869,0,1.721-0.076,2.553-0.211l1.753,2.165l2.646,3.267l2.646,3.267l0.13,0.2c1.54,2.022,2.454,4.547,2.454,7.285  c0,3.323-1.347,6.332-3.525,8.51c-0.139,0.139-0.291,0.265-0.437,0.397c-0.58,0.463-1.048,0.835-1.36,1.082  c-1.529,1.03-3.311,1.709-5.23,1.945c-0.446,0.049-0.913,0.081-1.41,0.081c-1.132,0-2.156-0.142-3.073-0.373  c-0.003-0.001-0.006-0.001-0.008-0.002c-0.295-0.074-0.578-0.158-0.85-0.249c-0.071-0.024-0.14-0.052-0.211-0.077  c-0.305-0.108-0.595-0.225-0.871-0.348c-0.227-0.102-0.452-0.207-0.671-0.323c-0.083-0.044-0.163-0.088-0.243-0.132  c-0.953-0.532-1.828-1.188-2.599-1.95c-0.151-0.168-0.565-0.647-1.143-1.322c-1.523-2.019-2.437-4.539-2.437-7.358l0-2.353  C25.484,67.75,28.346,71.29,28.346,71.29z M48.265,85.21c-0.721,0.572-5.791,4.645-14.059,4.645c-7.342,0-12.095-3.175-12.095-3.175  v-10.1c0,0,2.436,3.071,7.057,4.55c0.249,0.082,0.504,0.151,0.758,0.221c0.133,0.036,0.266,0.071,0.402,0.103  c1.221,0.3,2.491,0.477,3.804,0.477c0.309,0,0.611-0.029,0.916-0.046c0.109-0.005,0.22-0.009,0.327-0.017  c0.225-0.017,0.448-0.037,0.671-0.063c4.724-0.524,7.389-2.897,7.389-2.897c0.004-0.003,0.011-0.009,0.016-0.013  c0.384-0.278,0.755-0.571,1.111-0.882c4.248-3.388,17.153-13.785,18.92-15.209l0.201-0.162c0.653-0.476,1.461-0.754,2.331-0.754  c2.185,0,3.956,1.771,3.956,3.956c0,1.133-0.477,2.156-1.24,2.877C68.732,68.724,51.958,82.28,48.265,85.21z M63.544,77.882  c4.193-3.385,7.732-6.247,7.732-6.247c1.505-1.422,2.565-3.546,2.565-5.788c0-4.322-3.503-7.825-7.825-7.825  c-1.704,0-3.656,0.823-4.959,1.773c-1.068,0.86-6.338,5.102-11.288,9.079c0.167-0.924,0.268-1.871,0.268-2.843  c0-0.879-0.077-1.739-0.214-2.58l2.175-1.761l3.267-2.646l3.267-2.646l0.199-0.13c2.022-1.54,4.547-2.454,7.285-2.454  c3.323,0,6.332,1.347,8.51,3.525c0.222,0.222,0.43,0.459,0.634,0.698c0.15,0.188,0.285,0.358,0.41,0.515  c1.549,2.026,2.48,4.55,2.48,7.297c0,3.323-1.347,6.332-3.525,8.51c-0.193,0.193-0.401,0.371-0.607,0.551  c-0.109,0.094-0.227,0.195-0.354,0.305c-2.067,1.667-4.705,2.669-7.669,2.669L63.544,77.882z M86.701,77.874h-10.1  c0,0,5.332-4.213,5.332-12.095c0-5.871-3.003-9.23-3.003-9.23c-0.121-0.155-0.309-0.392-0.542-0.685  c-0.051-0.063-0.099-0.128-0.151-0.19c-3.158-3.966-13.957-17.369-15.41-19.173l-0.162-0.201c-0.476-0.653-0.754-1.461-0.754-2.331  c0-2.185,1.771-3.956,3.956-3.956c1.133,0,2.155,0.477,2.877,1.24c0,0,13.556,16.774,16.487,20.467  c0.572,0.721,4.645,5.791,4.645,14.059C89.876,73.122,86.701,77.874,86.701,77.874z"
        ></path>
      </g>
      <g className={className} transform="matrix(3,0,0,3,90,10)">
        <path d="M10.24 6 l0 1.56 l-3.88 0 l0 12.44 l-1.66 0 l0 -12.44 l-3.9 0 l0 -1.56 l9.44 0 z M23.560000000000002 20 l-1.44 -3.3 l-7.48 0 l-1.44 3.3 l-1.76 0 l6.24 -14 l1.38 0 l6.26 14 l-1.76 0 z M15.260000000000002 15.3 l6.24 0 l-3.12 -7.12 z M37.2 20 l-1.8 0 l-3.54 -5.04 l-0.38 0 l-2.9 0 l0 5.04 l-1.66 0 l0 -14 l4.56 0 c3.14 0 4.96 1.92 4.96 4.52 c0 2 -1.08 3.56 -3 4.16 z M28.58 7.5600000000000005 l0 5.92 l2.86 0 c2.02 0 3.34 -1.04 3.34 -2.96 c0 -1.94 -1.32 -2.96 -3.34 -2.96 l-2.86 0 z M40.66 18.44 l6.66 0 l0 1.56 l-7.06 0 l-1.26 0 l0 -14 l1.66 0 l6.48 0 l0 1.56 l-6.48 0 l0 4.64 l5.04 0 l0 1.52 l-5.04 0 l0 4.72 z M60.739999999999995 6 l1.76 0 l-6.26 14 l-1.38 0 l-6.24 -14 l1.76 0 l5.18 11.82 z M65.76 6 l0 14 l-1.66 0 l0 -14 l1.66 0 z M77.19999999999999 6 l0 1.56 l-3.88 0 l0 12.44 l-1.66 0 l0 -12.44 l-3.9 0 l0 -1.56 l9.44 0 z M90.7 6 l-5.22 7.54 l0 6.46 l-1.66 0 l0 -6.46 l-5.22 -7.54 l1.9 0 l4.14 6.02 l4.16 -6.02 l1.9 0 z"></path>
      </g>
    </svg>
  )
}
