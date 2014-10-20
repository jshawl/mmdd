require 'sinatra'
require 'sinatra/reloader'
require 'sass'
require 'rest-client'
require 'json'
require './env' if File.exists?('env.rb')

enable :sessions
set :session_secret, ENV['SESSION_SECRET']

CLIENT_ID = ENV['GH_BASIC_CLIENT_ID']
CLIENT_SECRET = ENV['GH_BASIC_SECRET_ID']
URL = ENV['GH_URL']

get '/' do
  session['access_token'] ||= ''
  erb :index, :locals => { 
    :client_id => CLIENT_ID,
    :access_token => session['access_token'], 
    :url => URL,
    :user_name => session['user_name'],
    :avatar_url => session['avatar_url']
  }
end

get '/:gist_id' do
  session['access_token'] ||= ''
  erb :index, :locals => { 
    :client_id => CLIENT_ID,
    :access_token => session['access_token'], 
    :url => URL,
    :user_name => session['user_name'],
    :avatar_url => session['avatar_url']
  }
end

get '/logout' do
  session['access_token'] = ''
  redirect to('/')
end

post '/create-gist' do
  ext = params[:extention]
  input_name = 'mmdd' + Time.now.to_i.to_s + '.md'
  res = RestClient.post('https://api.github.com/gists?access_token='+ session['access_token'], {
	'description' => 'mmdd',
	'public' => false,
	'files' => {
	  input_name => {
	    "content"=> params[:input]
	  }
	}
     }.to_json
   ) 
end

get '/callback' do
  session_code = request.env['rack.request.query_hash']['code']
  result = RestClient.post('https://github.com/login/oauth/access_token',
                          {:client_id => CLIENT_ID,
                           :client_secret => CLIENT_SECRET,
                           :code => session_code},
                           :accept => :json)
  session['access_token'] = JSON.parse(result)['access_token']
  user = JSON.parse(RestClient.get('https://api.github.com/user?access_token=' + session['access_token']))

  session['user_name'] = user['login']
  session['avatar_url'] = user['avatar_url']
  redirect to('/');
end
